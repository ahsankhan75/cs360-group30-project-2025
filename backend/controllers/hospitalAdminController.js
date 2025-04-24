const HospitalAdmin = require('../models/hospitalAdminModel');
const Hospital = require('../models/hospitalModel');
const BloodRequest = require('../models/blood_request');
const Review = require('../models/reviewModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Generate JWT token
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// Login hospital admin
const loginHospitalAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hospitalAdmin = await HospitalAdmin.login(email, password);

    // Get hospital information
    const hospital = await Hospital.findById(hospitalAdmin.hospitalId);

    // Create token
    const token = createToken(hospitalAdmin._id);

    res.status(200).json({
      email: hospitalAdmin.email,
      fullName: hospitalAdmin.fullName,
      hospitalId: hospitalAdmin.hospitalId,
      hospitalName: hospital ? hospital.name : 'Unknown Hospital',
      permissions: hospitalAdmin.permissions,
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Signup hospital admin
const signupHospitalAdmin = async (req, res) => {
  const { email, password, fullName, hospitalId } = req.body;

  try {
    const hospitalAdmin = await HospitalAdmin.signup(email, password, fullName, hospitalId);

    // Get hospital information
    const hospital = await Hospital.findById(hospitalAdmin.hospitalId);

    res.status(201).json({
      email: hospitalAdmin.email,
      fullName: hospitalAdmin.fullName,
      hospitalId: hospitalAdmin.hospitalId,
      hospitalName: hospital ? hospital.name : 'Unknown Hospital',
      status: hospitalAdmin.status,
      message: 'Registration successful. Your account is pending approval.'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get hospital admin dashboard data
const getHospitalAdminDashboard = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;

    // Get hospital details
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // Get blood requests for this hospital
    const bloodRequests = await BloodRequest.find({
      hospitalName: hospital.name
    }).sort({ datePosted: -1 });

    // Count pending and accepted requests
    const pendingRequestsCount = bloodRequests.filter(req => !req.accepted).length;
    const acceptedRequestsCount = bloodRequests.filter(req => req.accepted).length;

    // Group blood requests by blood type
    const bloodTypeStats = {};
    bloodRequests.forEach(req => {
      if (!bloodTypeStats[req.bloodType]) {
        bloodTypeStats[req.bloodType] = { total: 0, pending: 0, accepted: 0 };
      }
      bloodTypeStats[req.bloodType].total += 1;
      if (req.accepted) {
        bloodTypeStats[req.bloodType].accepted += 1;
      } else {
        bloodTypeStats[req.bloodType].pending += 1;
      }
    });

    // Get reviews for this hospital
    const reviews = await Review.find({ hospitalId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'email fullName');

    // Get review stats
    const reviewStats = await Review.aggregate([
      { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
      { $group: {
          _id: null,
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }}
    ]);

    const reviewCount = reviewStats.length > 0 ? reviewStats[0].count : 0;
    const averageRating = reviewStats.length > 0 ? reviewStats[0].avgRating : 0;

    res.status(200).json({
      hospital,
      stats: {
        totalBloodRequests: bloodRequests.length,
        activeBloodRequests: pendingRequestsCount,
        completedBloodRequests: acceptedRequestsCount,
        bloodTypeStats,
        reviewCount,
        averageRating
      },
      recentBloodRequests: bloodRequests.slice(0, 5), // Get 5 most recent requests
      recentReviews: reviews
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get blood requests for hospital
const getHospitalBloodRequests = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;
    console.log('Getting blood requests for hospital ID:', hospitalId);

    // Get hospital details
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // Get blood requests with optional filtering
    const { status, bloodType } = req.query;

    // Build a more efficient query that combines both hospitalId and hospitalName
    const query = {
      $or: [
        { hospitalId: hospitalId },
        { hospitalName: hospital.name }
      ]
    };

    // Add filters if provided
    if (status === 'pending') query.accepted = false;
    if (status === 'accepted') query.accepted = true;
    if (bloodType) query.bloodType = bloodType;

    console.log('Blood request query:', JSON.stringify(query));

    // Use a single query with a timeout to prevent long-running operations
    const bloodRequests = await BloodRequest.find(query)
      .populate('acceptedBy', 'email fullName profilePicture')
      .sort({ datePosted: -1 })
      .maxTimeMS(10000) // 10 second timeout for the database query
      .lean(); // Use lean() for better performance

    console.log(`Found ${bloodRequests.length} blood requests`);

    // Return the results directly
    res.status(200).json(bloodRequests);
  } catch (error) {
    console.error('Error getting hospital blood requests:', error);

    // Check if it's a timeout error
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      return res.status(408).json({ error: 'Request timed out. Please try again later.' });
    }

    res.status(400).json({ error: error.message || 'Failed to get blood requests' });
  }
};

// Create blood request for hospital
const createBloodRequest = async (req, res) => {
  try {
    console.log('Creating blood request with body:', JSON.stringify(req.body));
    const hospitalId = req.hospitalAdmin.hospitalId;

    // Get hospital details
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const { bloodType, urgencyLevel, unitsNeeded, contactNumber, contactEmail } = req.body;

    // Validate required fields
    if (!bloodType) {
      return res.status(400).json({ error: 'Blood type is required' });
    }

    // Calculate expiry date (7 days from now)
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(now.getDate() + 7);

    // Create request data object
    const requestData = {
      // requestId will be generated by pre-save middleware
      hospitalId: hospitalId, // Add the hospital ID reference
      hospitalName: hospital.name,
      bloodType,
      urgencyLevel: urgencyLevel || 'Normal',
      unitsNeeded: parseInt(unitsNeeded) || 1,
      location: hospital.location?.address || 'Unknown location', // Use the hospital's stored city
      cityu: hospital.cityu || null, // Add the hospital's cityu field for filtering
      datePosted: now,
      expiryDate: expiryDate,
      contactNumber: contactNumber || 'Not provided',
      email: contactEmail || req.hospitalAdmin.email,
      latitude: hospital.location?.coordinates?.[1] || null,
      longitude: hospital.location?.coordinates?.[0] || null,
      accepted: false
    };

    console.log('Attempting to create blood request with data:', JSON.stringify(requestData));

    // Create new blood request
    const bloodRequest = await BloodRequest.create(requestData);
    console.log('Blood request created successfully:', bloodRequest._id);

    // Return the created blood request
    res.status(201).json(bloodRequest);
  } catch (error) {
    console.error('Error creating blood request:', error);
    res.status(400).json({ error: error.message || 'Failed to create blood request' });
  }
};

// Update hospital profile
const updateHospitalProfile = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;
    const { resources, contact, services, insurance_accepted, location, cityu } = req.body;

    // Find hospital
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // Create a new update object to avoid modifying the entire document
    const updateData = {};

    // Update resources if provided
    if (resources) {
      updateData.resources = {
        ...(hospital.resources ? hospital.resources.toObject() : {}),
        ...resources
      };
    }

    // Update contact information if provided
    if (contact) {
      updateData.contact = {
        ...(hospital.contact ? hospital.contact.toObject() : {}),
        ...contact
      };
    }

    // Update location (address/city) if provided
    if (location && location.address) {
      updateData.location = {
        ...(hospital.location ? hospital.location.toObject() : { type: 'Point', coordinates: [0, 0] }),
        address: location.address
      };
    }

    // Update cityu field if provided
    if (cityu !== undefined) {
      updateData.cityu = cityu;
      // Also update the location.address with the same city value
      if (!updateData.location) {
        updateData.location = {
          ...(hospital.location ? hospital.location.toObject() : { type: 'Point', coordinates: [0, 0] }),
          address: cityu
        };
      } else {
        updateData.location.address = cityu;
      }
    }

    // Update services (specializations) if provided
    if (services) {
      updateData.services = services;
    }

    // Update insurance accepted if provided
    if (insurance_accepted) {
      updateData.insurance_accepted = insurance_accepted;
    }

    // Update last_updated timestamp
    updateData.last_updated = new Date();

    console.log('Updating hospital with data:', JSON.stringify(updateData, null, 2));

    try {
      // Use findByIdAndUpdate to update only the specified fields
      const updatedHospital = await Hospital.findByIdAndUpdate(
        hospitalId,
        { $set: updateData },
        { new: true, runValidators: false }
      );

      if (!updatedHospital) {
        throw new Error('Failed to update hospital - no document returned');
      }

      res.status(200).json(updatedHospital);
    } catch (updateError) {
      console.error('Error during findByIdAndUpdate:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating hospital profile:', error);
    res.status(400).json({ error: error.message || 'Unknown error updating hospital profile' });
  }
};

// Get list of pending hospital admin accounts (for superadmin)
const getPendingHospitalAdmins = async (req, res) => {
  try {
    const pendingAdmins = await HospitalAdmin.find({ status: 'pending' })
      .populate('hospitalId', 'name location')
      .sort({ createdAt: -1 });

    // Transform the data to include hospitalName directly on the admin object
    const formattedAdmins = pendingAdmins.map(admin => {
      const adminObj = admin.toObject();
      return {
        ...adminObj,
        hospitalName: adminObj.hospitalId ? adminObj.hospitalId.name : 'Unknown Hospital'
      };
    });

    res.status(200).json(formattedAdmins);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Approve or reject hospital admin (for superadmin)
const updateHospitalAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const hospitalAdmin = await HospitalAdmin.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!hospitalAdmin) {
      return res.status(404).json({ error: 'Hospital admin not found' });
    }

    res.status(200).json(hospitalAdmin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all reviews for a hospital
const getHospitalReviews = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;

    // Get hospital details
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // Get all reviews for this hospital
    const reviews = await Review.find({ hospitalId })
      .sort({ createdAt: -1 })
      .populate('userId', 'email fullName');

    // Get review stats
    const reviewStats = await Review.aggregate([
      { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
      { $group: {
          _id: null,
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }}
    ]);

    const stats = reviewStats.length > 0 ? {
      count: reviewStats[0].count,
      avgRating: reviewStats[0].avgRating,
      distribution: {
        5: reviewStats[0].rating5,
        4: reviewStats[0].rating4,
        3: reviewStats[0].rating3,
        2: reviewStats[0].rating2,
        1: reviewStats[0].rating1
      }
    } : {
      count: 0,
      avgRating: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };

    res.status(200).json({
      hospital,
      reviews,
      stats
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  loginHospitalAdmin,
  signupHospitalAdmin,
  getHospitalAdminDashboard,
  getHospitalBloodRequests,
  createBloodRequest,
  updateHospitalProfile,
  getPendingHospitalAdmins,
  updateHospitalAdminStatus,
  getHospitalReviews
};