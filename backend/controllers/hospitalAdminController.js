const HospitalAdmin = require('../models/hospitalAdminModel');
const Hospital = require('../models/hospitalModel');
const BloodRequest = require('../models/blood_request');
const Review = require('../models/reviewModel');
const MedicalCard = require('../models/medicalCardModel');
const crypto = require('crypto'); // Added for password reset
const validator = require('validator'); // Added for password reset validation
const bcrypt = require('bcrypt'); // Added for password hashing in reset
const nodemailer = require('nodemailer'); // Added for sending reset email
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
    // Ensure hospitalAdmin exists and has hospitalId before proceeding
    if (!hospitalAdmin || !hospitalAdmin.hospitalId) {
        // This case should ideally be handled within HospitalAdmin.login
        // but adding a check here for robustness.
        return res.status(404).json({ error: 'Admin account details incomplete.' });
    }
    const hospital = await Hospital.findById(hospitalAdmin.hospitalId);
    const token = createToken(hospitalAdmin._id);

    res.status(200).json({
      email: hospitalAdmin.email,
      fullName: hospitalAdmin.fullName,
      hospitalId: hospitalAdmin.hospitalId,
      // Provide a default name if hospital somehow isn't found
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

  // Validate if hospitalId is a valid ObjectId format
  if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ error: 'Invalid Hospital ID format.' });
  }

  try {
      // Check if the provided hospitalId actually exists
      const hospitalExists = await Hospital.findById(hospitalId);
      if (!hospitalExists) {
          return res.status(404).json({ error: 'Selected hospital does not exist.' });
      }

      // Perform signup using the static method on the model
      const hospitalAdmin = await HospitalAdmin.signup(email, password, fullName, hospitalId);

      // Respond with success message and basic details
      res.status(201).json({
        email: hospitalAdmin.email,
        fullName: hospitalAdmin.fullName,
        hospitalId: hospitalAdmin.hospitalId,
        hospitalName: hospitalExists.name, // Use the name from the found hospital
        status: hospitalAdmin.status, // Should be 'pending' initially
        message: 'Registration successful. Your account is pending approval by a superadmin.'
      });
  } catch (error) {
    // Log the error for debugging on the server
    console.error("Signup Error:", error.message);
    // Send back specific error message from the signup method (e.g., "Email already in use")
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

    // Fetch hospital details (needed for name in the $or query)
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found for this admin' });

    const { status, bloodType } = req.query;

    // Build a query that checks for matching hospitalId OR hospitalName (for robustness with potential old data)
    const query = {
      $or: [
        { hospitalId: new mongoose.Types.ObjectId(hospitalId) }, // Match by ID (preferred)
        { hospitalName: hospital.name } // Match by name (fallback)
      ]
    };

    // Add filters if provided
    if (status === 'pending') query.accepted = false;
    if (status === 'accepted') query.accepted = true;
    if (bloodType) query.bloodType = bloodType;

    console.log('Blood request query:', JSON.stringify(query));

    // Use a single query with a timeout and lean for performance
    const bloodRequests = await BloodRequest.find(query)
      .populate('acceptedBy', 'email fullName profilePicture') // Populate details of user who accepted
      .sort({ datePosted: -1 }) // Sort by most recent
      .maxTimeMS(10000) // 10 second timeout for the database query
      .lean(); // Use lean() for better performance on read-heavy operations

    console.log(`Found ${bloodRequests.length} blood requests`);

    // Return the results directly
    res.status(200).json(bloodRequests);
  } catch (error) {
    console.error('Error getting hospital blood requests:', error);

    // Check if it's a timeout error from Mongoose
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      return res.status(408).json({ error: 'Database query timed out. Please try again later.' });
    }

    // General error handling
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
      // Location details from hospital record
      location: hospital.location?.address || 'Address not available', // Main address string
      cityu: hospital.cityu || null, // City/Urban unit if available on hospital model
      latitude: hospital.location?.coordinates?.[1] || null, // Geo Coordinates
      longitude: hospital.location?.coordinates?.[0] || null, // Geo Coordinates
      datePosted: now,
      expiryDate: expiryDate,
      // Contact details
      contactNumber: contactNumber || hospital.contact?.phone || 'Contact number not provided', // Use provided, then hospital's, then default
      email: contactEmail || req.hospitalAdmin.email, // Use provided or admin's email
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

    // Destructure expected updatable fields from request body
    const { resources, contact, services, insurance_accepted, location, cityu } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    const updateData = { $set: {} }; // Use $set to update specific fields

    // Carefully merge nested objects if they exist, using dot notation with $set
    if (resources && typeof resources === 'object') {
        for (const key in resources) {
            // Only update fields explicitly provided in the request
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

    // Update location address if provided
    if (location && location.address !== undefined) {
        updateData.$set['location.address'] = location.address;
        // Note: Updating coordinates would require separate handling if needed
    }

     // Update cityu field if provided (allows setting to empty string or null)
     if (cityu !== undefined) {
        updateData.$set['cityu'] = cityu;
     }

    // Update array fields directly if provided and are arrays
    if (services && Array.isArray(services)) {
        updateData.$set['services'] = services;
    }
    if (insurance_accepted && Array.isArray(insurance_accepted)) {
        updateData.$set['insurance_accepted'] = insurance_accepted;
    }

    // Always update the last_updated timestamp
    updateData.$set['last_updated'] = new Date();

    // Prevent updating if only last_updated is present (no actual data changes sent)
     if (Object.keys(updateData.$set).length <= 1) {
         return res.status(400).json({ error: 'No valid fields provided for update.' });
     }

    // Perform the update using findByIdAndUpdate
    const updatedHospital = await Hospital.findByIdAndUpdate(
        hospitalId,
        updateData,
        // Options: return the updated document, run schema validators for paths being set
        { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedHospital) throw new Error('Failed to update hospital profile');

    res.status(200).json(updatedHospital); // Respond with the updated hospital document
  } catch (error) {
    console.error('Error updating hospital profile:', error);
    // Check for Mongoose validation errors specifically
    if (error instanceof mongoose.Error.ValidationError) {
        // Construct a user-friendly error message from validation errors
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ error: "Validation failed: " + messages.join('. ') });
    }
    // General error response
    res.status(500).json({ error: 'Failed to update hospital profile. ' + error.message });
  }
};

// --- Superadmin Functions ---

// Get pending hospital admin registrations
const getPendingHospitalAdmins = async (req, res) => {
  // This route should be protected by a superadmin role check middleware
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
  // This route should be protected by a superadmin role check middleware
  try {
    const { id } = req.params; // Admin ID to update
    const { status } = req.body; // New status ('approved' or 'rejected')

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Admin ID format.' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be "approved" or "rejected".' });
    }

    // Prepare update object
    const update = { status };
    if (status === 'approved') {
        // Define default permissions for newly approved admins
        update.permissions = ['manage_requests', 'view_dashboard', 'update_profile'];
    } else {
        // Clear permissions if rejecting (optional, depends on requirements)
        update.permissions = [];
    }

    // Find and update the admin's status and permissions
    const hospitalAdmin = await HospitalAdmin.findByIdAndUpdate(id, update, { new: true });

    if (!hospitalAdmin) return res.status(404).json({ error: 'Hospital admin account not found.' });

    // TODO: Optionally send an email notification to the admin about the status change using nodemailer

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
    // Note: MedicalCard model likely uses 'email' as a key field
    const medicalCard = await MedicalCard.findOne({ email: bloodRequest.acceptedBy.email });

    if (!medicalCard) {
        // It's possible the user accepted but doesn't have a medical card filled out
        return res.status(404).json({ error: 'Medical card not found for the accepting user.' });
    }

    // Return the relevant medical card details
    // Be mindful of sensitive information - only return what's necessary for the hospital context
    res.status(200).json({
        fullName: medicalCard.fullName || bloodRequest.acceptedBy.fullName, // Use card or user profile name
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

// --- Password Reset Functionality ---

// Initiate password reset process
const hospitalAdminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const user = await HospitalAdmin.findOne({ email });
    if (!user) {
        // Important: Do not reveal if the user exists or not for security
        console.log(`Password reset attempt for non-existent email: ${email}`);
        return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate a random, unguessable token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Hash the token before saving it to the database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiry on the user document
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600 * 1000; // Token valid for 1 hour (3600 seconds * 1000 ms)
    await user.save();

    // Construct the reset URL (use environment variables for base URL in production)
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/hospital-admin/reset-password/${resetToken}`;

    // Configure nodemailer transporter (use environment variables for credentials)
     const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: (process.env.SMTP_PORT || 587) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

     if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("SMTP credentials are not set in environment variables.");
        return res.status(500).json({ error: 'Email configuration error. Cannot send reset link.' });
     }

    // Send the email
    await transporter.sendMail({
      from: `"BloodLink Support" <${process.env.SMTP_USER}>`, // Sender address
      to: user.email, // User's email
      subject: 'Your BloodLink Hospital Admin Password Reset Link (Valid 1 Hour)', // Subject line
      // Plain text body (optional)
      // text: `You requested a password reset. Please click the following link, or paste it into your browser to complete the process: ${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
      // HTML body
      html: `<p>You requested a password reset for your BloodLink Hospital Admin account associated with ${user.email}.</p>
             <p>Please click the link below to set a new password:</p>
             <p><a href="${resetURL}" target="_blank" style="background-color: #0d9488; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
             <p>This link is valid for 1 hour. If you did not request this password reset, please ignore this email.</p>
             <p>Link: ${resetURL}</p><hr><p>Thank you,<br>The BloodLink Team</p>`
    });

    // Send generic success message regardless of whether user existed
    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (err) {
    console.error('hospitalAdminForgotPassword error:', err);
    // Avoid exposing internal errors to the client
    res.status(500).json({ error: 'An error occurred while attempting to send the password reset link. Please try again later.' });
  }
};

// Handle the actual password reset using the token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // The raw token from the URL
    const { password } = req.body; // The new password

    // Validate the incoming password
    if (!password) {
      return res.status(400).json({ error: 'New password is required.' });
    }
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        error: 'Password not strong enough. It must be at least 8 characters long and include lowercase, uppercase, numbers, and symbols.'
      });
    }

    // Hash the token received from the URL to match the one stored in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user by the hashed token and check if the token is still valid (not expired)
    const user = await HospitalAdmin.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() } // Check if expiry date is greater than current time
    });

    // If no user found or token expired
    if (!user) {
        console.log(`Password reset attempt with invalid/expired token hash: ${hashedToken}`);
        return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    // --- Token is valid, proceed to reset password ---

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear the reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Save the updated user document
    await user.save();

    // TODO: Optionally log the user in immediately by creating a new JWT token
    // const loginToken = createToken(user._id);
    // res.status(200).json({ message: 'Password has been reset successfully.', token: loginToken, /* other user details */ });

    // Respond with success message
    res.status(200).json({ message: 'Your password has been reset successfully.' });

  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ error: 'An error occurred while resetting the password. Please try again later.' });
  }
};

// Export all controller functions including password reset
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
  resetPassword, // Added
  hospitalAdminForgotPassword // Added
};