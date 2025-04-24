const express = require('express');
const router = express.Router();
const {
  loginHospitalAdmin,
  signupHospitalAdmin,
  getHospitalAdminDashboard,
  getHospitalBloodRequests,
  createBloodRequest,
  updateHospitalProfile,
  getPendingHospitalAdmins,
  updateHospitalAdminStatus,
  getHospitalReviews,
  getAcceptedUserMedicalCard,
  hospitalAdminForgotPassword,
  resetPassword
} = require('../controllers/hospitalAdminController');

const {
  getPendingUserAcceptances,
  approveRejectUserAcceptance,
  getUserMedicalCard
} = require('../controllers/bloodRequestController');
const requireHospitalAdminAuth = require('../middleware/requireHospitalAdminAuth');
const requireAdmin = require('../middleware/requireAdmin');
const requireAuth = require('../middleware/requireAuth');

// Public routes
router.post('/login', loginHospitalAdmin);
router.post('/signup', signupHospitalAdmin);
router.post('/forgot-password', hospitalAdminForgotPassword);
router.post('/reset-password/:token', resetPassword);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Hospital Admin API is available',
    time: new Date().toISOString()
  });
});

// Protected hospital admin routes
router.get('/dashboard', requireHospitalAdminAuth, getHospitalAdminDashboard);
router.get('/blood-requests', requireHospitalAdminAuth, getHospitalBloodRequests);
router.post('/blood-requests', requireHospitalAdminAuth, createBloodRequest);
router.patch('/profile', requireHospitalAdminAuth, updateHospitalProfile);
router.get('/reviews', requireHospitalAdminAuth, getHospitalReviews);

// Blood request acceptance management routes
router.get('/blood-requests/pending-acceptances', requireHospitalAdminAuth, getPendingUserAcceptances);
router.patch('/blood-requests/:requestId/user-acceptance', requireHospitalAdminAuth, approveRejectUserAcceptance);
router.get('/blood-requests/:requestId/user-medical-card', requireHospitalAdminAuth, getUserMedicalCard);

// Super admin routes for managing hospital admins
router.get('/pending', requireAuth, requireAdmin, getPendingHospitalAdmins);
router.patch('/:id/status', requireAuth, requireAdmin, updateHospitalAdminStatus);
router.get('/accepted-user-card/:requestId', requireHospitalAdminAuth, getAcceptedUserMedicalCard);

module.exports = router;