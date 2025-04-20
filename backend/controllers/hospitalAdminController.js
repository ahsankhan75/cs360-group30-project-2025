const HospitalAdmin = require('../models/hospitalAdminModel');
const Hospital = require('../models/hospitalModel');
const BloodRequest = require('../models/blood_request');
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
    
    res.status(200).json({
      hospital,
      stats: {
        totalRequests: bloodRequests.length,
        pendingRequests: pendingRequestsCount,
        acceptedRequests: acceptedRequestsCount,
        bloodTypeStats
      },
      recentRequests: bloodRequests.slice(0, 5) // Get 5 most recent requests
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get blood requests for hospital
const getHospitalBloodRequests = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;
    
    // Get hospital details
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    // Get blood requests with optional filtering
    const { status, bloodType } = req.query;
    
    const query = { hospitalName: hospital.name };
    if (status === 'pending') query.accepted = false;
    if (status === 'accepted') query.accepted = true;
    if (bloodType) query.bloodType = bloodType;
    
    const bloodRequests = await BloodRequest.find(query)
      .sort({ datePosted: -1 });
    
    res.status(200).json(bloodRequests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create blood request for hospital
const createBloodRequest = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;
    
    // Get hospital details
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    const { bloodType, urgencyLevel, unitsNeeded, contactNumber, contactEmail } = req.body;
    
    // Create new blood request
    const bloodRequest = await BloodRequest.create({
      requestId: mongoose.Types.ObjectId().toString(), // Generate unique ID
      hospitalName: hospital.name,
      bloodType,
      urgencyLevel: urgencyLevel || 'Normal',
      unitsNeeded: unitsNeeded || 1,
      location: hospital.location?.address || 'Unknown location',
      datePosted: new Date().toISOString(),
      contactNumber: contactNumber || 'Not provided',
      email: contactEmail || req.hospitalAdmin.email,
      latitude: hospital.location?.coordinates?.[1] || null,
      longitude: hospital.location?.coordinates?.[0] || null,
      accepted: false
    });
    
    res.status(201).json(bloodRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update hospital profile
const updateHospitalProfile = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;
    const { resources, contact } = req.body;
    
    // Find and update hospital
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    // Update resources if provided
    if (resources) {
      hospital.resources = {
        ...hospital.resources,
        ...resources
      };
    }
    
    // Update contact information if provided
    if (contact) {
      hospital.contact = {
        ...hospital.contact,
        ...contact
      };
    }
    
    await hospital.save();
    
    res.status(200).json(hospital);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

module.exports = {
  loginHospitalAdmin,
  signupHospitalAdmin,
  getHospitalAdminDashboard,
  getHospitalBloodRequests,
  createBloodRequest,
  updateHospitalProfile,
  getPendingHospitalAdmins,
  updateHospitalAdminStatus
};