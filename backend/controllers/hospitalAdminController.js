
const HospitalAdmin = require('../models/hospitalAdminModel');
const Hospital = require('../models/hospitalModel');
const BloodRequest = require('../models/blood_request');
const Review = require('../models/reviewModel');
const MedicalCard = require('../models/medicalCardModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Generate JWT token
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// Helper to generate 8-character lowercase alphanumeric requestId
const generateRequestId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let requestId = '';
  for (let i = 0; i < 8; i++) {
    requestId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return requestId;
};

// Login hospital admin
const loginHospitalAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hospitalAdmin = await HospitalAdmin.login(email, password);
    const hospital = await Hospital.findById(hospitalAdmin.hospitalId);
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

// Hospital dashboard
const getHospitalAdminDashboard = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    const bloodRequests = await BloodRequest.find({ hospitalName: hospital.name }).sort({ datePosted: -1 });
    const pending = bloodRequests.filter(r => !r.accepted).length;
    const accepted = bloodRequests.filter(r => r.accepted).length;

    const bloodTypeStats = {};
    bloodRequests.forEach(r => {
      if (!bloodTypeStats[r.bloodType]) {
        bloodTypeStats[r.bloodType] = { total: 0, pending: 0, accepted: 0 };
      }
      bloodTypeStats[r.bloodType].total += 1;
      r.accepted ? bloodTypeStats[r.bloodType].accepted++ : bloodTypeStats[r.bloodType].pending++;
    });

    const reviews = await Review.find({ hospitalId }).sort({ createdAt: -1 }).limit(5).populate('userId', 'email fullName');
    const reviewStats = await Review.aggregate([
      { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const reviewCount = reviewStats.length > 0 ? reviewStats[0].count : 0;
    const averageRating = reviewStats.length > 0 ? reviewStats[0].avgRating : 0;

    res.status(200).json({
      hospital,
      stats: {
        totalBloodRequests: bloodRequests.length,
        activeBloodRequests: pending,
        completedBloodRequests: accepted,
        bloodTypeStats,
        reviewCount,
        averageRating
      },
      recentBloodRequests: bloodRequests.slice(0, 5),
      recentReviews: reviews
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Fetch blood requests
const getHospitalBloodRequests = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    const { status, bloodType } = req.query;
    const query = { hospitalName: hospital.name };
    if (status === 'pending') query.accepted = false;
    if (status === 'accepted') query.accepted = true;
    if (bloodType) query.bloodType = bloodType;

    const bloodRequests = await BloodRequest.find(query).sort({ datePosted: -1 });
    res.status(200).json(bloodRequests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Create blood request with random requestId
const createBloodRequest = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) return res.status(400).json({ error: 'Invalid hospital ID' });

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    const { bloodType, urgencyLevel, unitsNeeded, contactNumber, contactEmail } = req.body;

    const requestId = generateRequestId();

    const bloodRequest = await BloodRequest.create({
      requestId,
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
    console.error('Error creating blood request:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// Update hospital profile
const updateHospitalProfile = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;
    const { resources, contact, services, insurance_accepted } = req.body;
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    const updateData = {};
    if (resources) updateData.resources = { ...(hospital.resources?.toObject() || {}), ...resources };
    if (contact) updateData.contact = { ...(hospital.contact?.toObject() || {}), ...contact };
    if (services) updateData.services = services;
    if (insurance_accepted) updateData.insurance_accepted = insurance_accepted;
    updateData.last_updated = new Date();

    const updatedHospital = await Hospital.findByIdAndUpdate(hospitalId, { $set: updateData }, { new: true, runValidators: false });
    if (!updatedHospital) throw new Error('Failed to update hospital');

    res.status(200).json(updatedHospital);
  } catch (error) {
    console.error('Error updating hospital profile:', error);
    res.status(400).json({ error: error.message });
  }
};

// Superadmin: get pending admins
const getPendingHospitalAdmins = async (req, res) => {
  try {
    const pendingAdmins = await HospitalAdmin.find({ status: 'pending' }).populate('hospitalId', 'name location').sort({ createdAt: -1 });

    const formatted = pendingAdmins.map(admin => ({
      ...admin.toObject(),
      hospitalName: admin.hospitalId ? admin.hospitalId.name : 'Unknown Hospital'
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Superadmin: update status
const updateHospitalAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const hospitalAdmin = await HospitalAdmin.findByIdAndUpdate(id, { status }, { new: true });
    if (!hospitalAdmin) return res.status(404).json({ error: 'Hospital admin not found' });

    res.status(200).json(hospitalAdmin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get reviews for hospital
const getHospitalReviews = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    const reviews = await Review.find({ hospitalId }).sort({ createdAt: -1 }).populate('userId', 'email fullName');

    const reviewStats = await Review.aggregate([
      { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

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
      : {
          count: 0,
          avgRating: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };

    res.status(200).json({ hospital, reviews, stats });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get accepted user's medical card
const getAcceptedUserMedicalCard = async (req, res) => {
  try {
    const { requestId } = req.params;
    const bloodRequest = await BloodRequest.findOne({ requestId }).populate('acceptedBy');
    if (!bloodRequest || !bloodRequest.acceptedBy) return res.status(404).json({ error: 'Accepted user not found' });

    const medicalCard = await MedicalCard.findOne({ email: bloodRequest.acceptedBy.email });
    if (!medicalCard) return res.status(404).json({ error: 'Medical card not found' });

    res.status(200).json(medicalCard);
  } catch (error) {
    console.error('Error fetching medical card:', error.message);
    res.status(500).json({ error: error.message });
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
  getHospitalReviews,
  getAcceptedUserMedicalCard
};