const HospitalAdmin = require('../models/hospitalAdminModel');
const Hospital = require('../models/hospitalModel');
const BloodRequest = require('../models/blood_request');
const Review = require('../models/reviewModel');
const MedicalCard = require('../models/medicalCardModel');
const crypto     = require('crypto');
const validator = require('validator');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Generate JWT token
const createToken = (_id) => {
  // Ensure the SECRET is loaded from environment variables
  if (!process.env.SECRET) {
    throw new Error('JWT Secret is not defined in environment variables');
  }
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// Login hospital admin
const loginHospitalAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const hospitalAdmin = await HospitalAdmin.login(email, password);
    const hospital = await Hospital.findById(hospitalAdmin.hospitalId);
    const token = createToken(hospitalAdmin._id);

    res.status(200).json({
      email: hospitalAdmin.email,
      fullName: hospitalAdmin.fullName,
      hospitalId: hospitalAdmin.hospitalId,
      // Provide a default name if hospital somehow isn't found, although validation should prevent this
      hospitalName: hospital ? hospital.name : 'Unknown Hospital',
      permissions: hospitalAdmin.permissions,
      token
    });
  } catch (error) {
    // Log the error for debugging on the server
    console.error("Login Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// Signup hospital admin
const signupHospitalAdmin = async (req, res) => {
  const { email, password, fullName, hospitalId } = req.body;

  if (!email || !password || !fullName || !hospitalId) {
    return res.status(400).json({ error: 'All fields (email, password, fullName, hospitalId) are required.' });
  }

  // Optional: Validate if hospitalId is a valid ObjectId and exists
  if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ error: 'Invalid Hospital ID format.' });
  }

  try {
      const hospitalExists = await Hospital.findById(hospitalId);
      if (!hospitalExists) {
          return res.status(404).json({ error: 'Selected hospital does not exist.' });
      }

      const hospitalAdmin = await HospitalAdmin.signup(email, password, fullName, hospitalId);

      res.status(201).json({
        email: hospitalAdmin.email,
        fullName: hospitalAdmin.fullName,
        hospitalId: hospitalAdmin.hospitalId,
        // Use the fetched hospital name directly
        hospitalName: hospitalExists.name,
        status: hospitalAdmin.status, // Should be 'pending' initially
        message: 'Registration successful. Your account is pending approval by a superadmin.'
      });
  } catch (error) {
    // Log the error for debugging on the server
    console.error("Signup Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// Hospital dashboard data
const getHospitalAdminDashboard = async (req, res) => {
  try {
    // hospitalAdmin should be populated by authentication middleware
    const hospitalId = req.hospitalAdmin?.hospitalId;
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ error: 'Invalid or missing hospital ID in token' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital associated with admin not found' });

    // Use hospitalId for querying requests for better accuracy
    const bloodRequests = await BloodRequest.find({ hospitalId }).sort({ datePosted: -1 });

    // Calculate request stats
    const pending = bloodRequests.filter(r => !r.accepted).length;
    const accepted = bloodRequests.filter(r => r.accepted).length;

    // Calculate blood type stats
    const bloodTypeStats = {};
    bloodRequests.forEach(r => {
      if (!bloodTypeStats[r.bloodType]) {
        bloodTypeStats[r.bloodType] = { total: 0, pending: 0, accepted: 0 };
      }
      bloodTypeStats[r.bloodType].total += 1;
      r.accepted ? bloodTypeStats[r.bloodType].accepted++ : bloodTypeStats[r.bloodType].pending++;
    });

    // Fetch recent reviews and stats
    const reviews = await Review.find({ hospitalId }).sort({ createdAt: -1 }).limit(5).populate('userId', 'email fullName');
    const reviewStats = await Review.aggregate([
      { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } }, // Ensure correct type matching
      {
        $group: {
          _id: null, // Group all matched documents
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const reviewCount = reviewStats.length > 0 ? reviewStats[0].count : 0;
    const averageRating = reviewStats.length > 0 ? reviewStats[0].avgRating : 0;

    res.status(200).json({
      hospital, // Send full hospital details
      stats: {
        totalBloodRequests: bloodRequests.length,
        activeBloodRequests: pending, // Renamed from pending for clarity
        completedBloodRequests: accepted, // Renamed from accepted
        bloodTypeStats,
        reviewCount,
        averageRating
      },
      recentBloodRequests: bloodRequests.slice(0, 5), // Use slice for safety if fewer than 5 exist
      recentReviews: reviews
    });
  } catch (error) {
    console.error('Error getting hospital admin dashboard:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard data. ' + error.message });
  }
};

// Fetch blood requests managed by the hospital admin
const getHospitalBloodRequests = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin?.hospitalId;
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return res.status(400).json({ error: 'Invalid or missing hospital ID in token' });
    }
    console.log('Getting blood requests for hospital ID:', hospitalId);

    // Fetch hospital details (optional, could rely on ID only)
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found for this admin' });

    const { status, bloodType } = req.query;

    // Build the base query using the reliable hospitalId
    const queryById = { hospitalId: new mongoose.Types.ObjectId(hospitalId) };
    if (status === 'pending') queryById.accepted = false;
    if (status === 'accepted') queryById.accepted = true;
    if (bloodType) queryById.bloodType = bloodType;

    console.log('Blood request query:', JSON.stringify(queryById));

    // Execute the query
    const bloodRequests = await BloodRequest.find(queryById)
      .populate('acceptedBy', 'email fullName profilePicture') // Populate user details if accepted
      .sort({ datePosted: -1 }); // Sort by most recent

    console.log(`Found ${bloodRequests.length} blood requests matching criteria.`);

    // No need to combine results from name query as hospitalId is more reliable and direct.
    // Keep the name query logic commented out unless specifically needed as a fallback.
    /*
    // Find by hospital name as a potential fallback (less reliable)
    const queryByName = { hospitalName: hospital.name };
    if (status === 'pending') queryByName.accepted = false;
    if (status === 'accepted') queryByName.accepted = true;
    if (bloodType) queryByName.bloodType = bloodType;

    const bloodRequestsByName = await BloodRequest.find(queryByName)
      .populate('acceptedBy', 'email fullName profilePicture')
      .sort({ datePosted: -1 });
    console.log(`Found ${bloodRequestsByName.length} blood requests by hospitalName (fallback)`);

    // Combine results, removing duplicates (if using both queries)
    const combinedRequests = [...bloodRequests]; // Start with ID results
    const requestIds = new Set(bloodRequests.map(r => r._id.toString()));

    bloodRequestsByName.forEach(request => {
      if (!requestIds.has(request._id.toString())) {
        combinedRequests.push(request);
        requestIds.add(request._id.toString());
      }
    });
    // Sort combined results if needed
    combinedRequests.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
    console.log(`Returning ${combinedRequests.length} total unique blood requests after potential fallback`);
    res.status(200).json(combinedRequests);
    */

    res.status(200).json(bloodRequests);

  } catch (error) {
    console.error('Error getting hospital blood requests:', error);
    res.status(500).json({ error: error.message || 'Failed to get blood requests' });
  }
};

// Create a new blood request
const createBloodRequest = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin?.hospitalId;
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return res.status(400).json({ error: 'Invalid or missing hospital ID in token' });
    }
    console.log('Creating blood request for hospital ID:', hospitalId);
    console.log('Request body:', JSON.stringify(req.body));

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found for this admin' });

    const { bloodType, urgencyLevel, unitsNeeded, contactNumber, contactEmail } = req.body;

    // --- Basic Validation ---
    if (!bloodType) {
      return res.status(400).json({ error: 'Blood type is required' });
    }
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodTypes.includes(bloodType)) {
        return res.status(400).json({ error: 'Invalid blood type provided.' });
    }
     const validUrgencyLevels = ['Normal', 'Urgent', 'Critical'];
     const finalUrgency = urgencyLevel && validUrgencyLevels.includes(urgencyLevel) ? urgencyLevel : 'Normal';

     const finalUnits = parseInt(unitsNeeded);
     if (isNaN(finalUnits) || finalUnits < 1) {
        return res.status(400).json({ error: 'Units needed must be a positive number.' });
     }


    // --- Prepare Request Data ---
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(now.getDate() + 7); // Set expiry to 7 days from now

    const requestData = {
      // requestId should be generated by pre-save middleware in the BloodRequest model
      hospitalId: new mongoose.Types.ObjectId(hospitalId), // Ensure it's an ObjectId
      hospitalName: hospital.name,
      bloodType,
      urgencyLevel: finalUrgency,
      unitsNeeded: finalUnits,
      // Use hospital's address and coordinates as default location info
      location: hospital.location?.address || 'Address not available',
      latitude: hospital.location?.coordinates?.[1] || null,
      longitude: hospital.location?.coordinates?.[0] || null,
      datePosted: now,
      expiryDate: expiryDate,
      // Use provided contact details or fallback to admin's email
      contactNumber: contactNumber || hospital.contact?.phone || 'Contact number not provided',
      email: contactEmail || req.hospitalAdmin.email, // Use admin's email as fallback
      accepted: false, // New requests are not accepted initially
      acceptedBy: null // Ensure acceptedBy is null initially
    };

    console.log('Attempting to create blood request with data:', JSON.stringify(requestData));

    // Create new blood request using the model
    const bloodRequest = await BloodRequest.create(requestData);
    console.log('Blood request created successfully:', bloodRequest._id, 'RequestId:', bloodRequest.requestId);

    // Return the newly created blood request document
    res.status(201).json(bloodRequest);

  } catch (error) {
    // Log the full error for detailed debugging
    console.error('Error creating blood request:', error);
    // Provide a generic error message or specific message if available
    res.status(400).json({ error: error.message || 'Failed to create blood request' });
  }
};

// Update hospital profile details (specific fields)
const updateHospitalProfile = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin?.hospitalId;
     if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return res.status(400).json({ error: 'Invalid or missing hospital ID in token' });
    }

    // It's safer to explicitly define which fields can be updated
    const { resources, contact, services, insurance_accepted } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    const updateData = { $set: {} }; // Use $set to update specific fields

    // Carefully merge nested objects if they exist
    if (resources && typeof resources === 'object') {
        for (const key in resources) {
            if (resources.hasOwnProperty(key)) {
                updateData.$set[`resources.${key}`] = resources[key];
            }
        }
    }
    if (contact && typeof contact === 'object') {
        for (const key in contact) {
            if (contact.hasOwnProperty(key)) {
                 updateData.$set[`contact.${key}`] = contact[key];
            }
        }
    }
    // Update arrays directly
    if (services && Array.isArray(services)) {
        updateData.$set['services'] = services;
    }
    if (insurance_accepted && Array.isArray(insurance_accepted)) {
        updateData.$set['insurance_accepted'] = insurance_accepted;
    }

    // Always update the last_updated timestamp
    updateData.$set['last_updated'] = new Date();

    // Prevent updating if no valid fields were provided
     if (Object.keys(updateData.$set).length <= 1) { // Only contains last_updated potentially
         return res.status(400).json({ error: 'No valid fields provided for update.' });
     }

    // Perform the update
    const updatedHospital = await Hospital.findByIdAndUpdate(
        hospitalId,
        updateData,
        // Return the updated document, run schema validators for paths being set
        { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedHospital) throw new Error('Failed to update hospital profile');

    res.status(200).json(updatedHospital);
  } catch (error) {
    console.error('Error updating hospital profile:', error);
    // Check for validation errors specifically
    if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ error: "Validation failed: " + error.message });
    }
    res.status(500).json({ error: 'Failed to update hospital profile. ' + error.message });
  }
};

// --- Superadmin Functions ---

// Get pending hospital admin registrations
const getPendingHospitalAdmins = async (req, res) => {
  // This should be protected by a superadmin role check middleware
  try {
    const pendingAdmins = await HospitalAdmin.find({ status: 'pending' })
      .populate('hospitalId', 'name location') // Populate hospital name and location
      .sort({ createdAt: -1 }); // Show newest first

    // Map to include hospitalName directly if hospitalId exists
    const formattedAdmins = pendingAdmins.map(admin => ({
      ...admin.toObject(), // Convert mongoose doc to plain object
      hospitalName: admin.hospitalId ? admin.hospitalId.name : 'Hospital Info Missing'
    }));

    res.status(200).json(formattedAdmins);
  } catch (error) {
    console.error('Error fetching pending hospital admins:', error);
    res.status(500).json({ error: 'Failed to retrieve pending admins. ' + error.message });
  }
};

// Update status of a hospital admin (approve/reject)
const updateHospitalAdminStatus = async (req, res) => {
  // This should be protected by a superadmin role check middleware
  try {
    const { id } = req.params; // Admin ID to update
    const { status } = req.body; // New status ('approved' or 'rejected')

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Admin ID format.' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be "approved" or "rejected".' });
    }

    // Find and update the admin's status
    // Optionally add permissions if approving
    const update = { status };
    if (status === 'approved') {
        // Define default permissions for approved admins
        update.permissions = ['manage_requests', 'view_dashboard', 'update_profile'];
    } else {
        // Optionally clear permissions if rejecting
        update.permissions = [];
    }


    const hospitalAdmin = await HospitalAdmin.findByIdAndUpdate(id, update, { new: true });

    if (!hospitalAdmin) return res.status(404).json({ error: 'Hospital admin account not found.' });

    // TODO: Optionally send an email notification to the admin about the status change

    res.status(200).json(hospitalAdmin); // Return the updated admin document
  } catch (error) {
    console.error('Error updating hospital admin status:', error);
    res.status(500).json({ error: 'Failed to update admin status. ' + error.message });
  }
};

// --- Other Hospital Admin Functions ---

// Get reviews for the admin's hospital
const getHospitalReviews = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin?.hospitalId;
     if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return res.status(400).json({ error: 'Invalid or missing hospital ID in token' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found for this admin' });

    // Fetch all reviews for the hospital
    const reviews = await Review.find({ hospitalId })
      .sort({ createdAt: -1 }) // Sort by most recent
      .populate('userId', 'email fullName'); // Populate user details

    // Aggregate statistics for the reviews
    const reviewStats = await Review.aggregate([
      { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
      {
        $group: {
          _id: null, // Group all reviews for this hospital
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          // Count reviews for each rating level
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    // Format the statistics, providing defaults if no reviews exist
    const stats = reviewStats.length > 0
      ? {
          count: reviewStats[0].count,
          avgRating: reviewStats[0].avgRating,
          distribution: {
            5: reviewStats[0].rating5,
            4: reviewStats[0].rating4,
            3: reviewStats[0].rating3,
            2: reviewStats[0].rating2,
            1: reviewStats[0].rating1
          }
        }
      : { // Default structure if no reviews found
          count: 0,
          avgRating: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };

    res.status(200).json({ hospital, reviews, stats });
  } catch (error) {
    console.error('Error fetching hospital reviews:', error);
    res.status(500).json({ error: 'Failed to retrieve hospital reviews. ' + error.message });
  }
};

// Get the medical card details of the user who accepted a specific blood request
const getAcceptedUserMedicalCard = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin?.hospitalId; // Verify admin belongs to the hospital of the request
    const { requestId } = req.params; // Get the unique requestId (e.g., 'a1b2c3d4')

     if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return res.status(400).json({ error: 'Invalid or missing hospital ID in admin token' });
    }

    // Find the blood request using the unique requestId
    const bloodRequest = await BloodRequest.findOne({ requestId })
        .populate('acceptedBy', 'email fullName'); // Populate basic user details

    if (!bloodRequest) return res.status(404).json({ error: 'Blood request not found.' });

    // Security Check: Ensure the request belongs to the admin's hospital
    if (bloodRequest.hospitalId.toString() !== hospitalId.toString()) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view details for this request.' });
    }

    // Check if the request has been accepted and by whom
    if (!bloodRequest.accepted || !bloodRequest.acceptedBy) {
        return res.status(404).json({ error: 'This request has not been accepted by a user yet.' });
    }

    // Fetch the medical card using the email of the user who accepted
    // Note: MedicalCard model likely uses 'email' as a key field based on schema design assumption
    const medicalCard = await MedicalCard.findOne({ email: bloodRequest.acceptedBy.email });

    if (!medicalCard) {
        // It's possible the user accepted but doesn't have a medical card filled out
        return res.status(404).json({ error: 'Medical card not found for the accepting user.' });
    }

    // Return the relevant medical card details
    // Be mindful of sensitive information - only return what's necessary for the hospital
    res.status(200).json({
        fullName: medicalCard.fullName, // Or from populated acceptedBy user
        bloodType: medicalCard.bloodType,
        dateOfBirth: medicalCard.dateOfBirth,
        // Include other relevant fields as needed, e.g., allergies, conditions
        allergies: medicalCard.allergies,
        medicalConditions: medicalCard.medicalConditions,
        contactNumber: medicalCard.contactNumber // May be useful
    });

  } catch (error) {
    console.error('Error fetching accepted user medical card:', error);
    res.status(500).json({ error: 'Failed to retrieve medical card details. ' + error.message });
  }
};


const hospitalAdminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await HospitalAdmin.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No user with that email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashed;
    user.passwordResetExpires = Date.now() + 3600 * 1000;
    await user.save();

    const resetURL = `http://localhost:3000/hospital-admin/reset-password/${resetToken}`;
    // if (user.isAdmin) {
    //   resetURL = `http://localhost:3000/admin/reset-password/${resetToken}`;
    // }// else {
    //   const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
    // }
    // const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      // host: process.env.SMTP_HOST,
      // port: Number(process.env.SMTP_PORT),
      host: 'smtp.gmail.com', 
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await transporter.sendMail({
      to: user.email,
      subject: 'Your password reset link (valid 1 hour)',
      html: `<p>Please click <a href="${resetURL}">here</a> to reset your password.</p>`
    });

    res.status(200).json({ message: 'Token sent to email' });
  } catch (err) {
    console.error('hospitalAdminForgotPassword error:', err)
    return res
      .status(500)
      .json({ error: 'Unable to send reset link. Please try again later.' })
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        error:
          'Password not strong enough. ' +
          'It must be at least 8 characters long and include lowercase, uppercase, numbers and symbols.'
      });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await HospitalAdmin.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Token invalid or expired' });

    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset.' });
  } catch (err) {
    console.error('resetPassword error:', err)
    return res
      .status(500)
      .json({ error: 'Unable to reset password. Please try again later.' })
  }
};
ForgotResetPassword
module.exports = {
  loginHospitalAdmin,
  signupHospitalAdmin,
  getHospitalAdminDashboard,
  getHospitalBloodRequests,
  createBloodRequest,
  updateHospitalProfile,
  getPendingHospitalAdmins, // Superadmin
  updateHospitalAdminStatus, // Superadmin
  getHospitalReviews,
  getAcceptedUserMedicalCard,
  resetPassword,
  hospitalAdminForgotPassword
};