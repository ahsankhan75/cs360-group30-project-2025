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
  updateHospitalAdminStatus
} = require('../controllers/hospitalAdminController');
const requireHospitalAdminAuth = require('../middleware/requireHospitalAdminAuth');
const requireAdmin = require('../middleware/requireAdmin');
const requireAuth = require('../middleware/requireAuth');

// Public routes
router.post('/login', loginHospitalAdmin);
router.post('/signup', signupHospitalAdmin);

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

// Super admin routes for managing hospital admins
router.get('/pending', requireAuth, requireAdmin, getPendingHospitalAdmins);
router.patch('/:id/status', requireAuth, requireAdmin, updateHospitalAdminStatus);

module.exports = router;