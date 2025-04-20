const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const { loginAdmin, signupAdmin } = require('../controllers/userController');
const { getDashboardStats, getAllUsers } = require('../controllers/adminController');
const { getPendingHospitalAdmins, updateHospitalAdminStatus } = require('../controllers/hospitalAdminController');

// Public admin routes
router.post('/login', loginAdmin);
router.post('/signup', signupAdmin);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Admin API is available',
    time: new Date().toISOString() 
  });
});

// Protected admin routes
router.get('/dashboard', requireAuth, requireAdmin, getDashboardStats);
router.get('/users', requireAuth, requireAdmin, getAllUsers);

// Hospital admin management routes
router.get('/hospital-admins/pending', requireAuth, requireAdmin, getPendingHospitalAdmins);
router.patch('/hospital-admins/:id/status', requireAuth, requireAdmin, updateHospitalAdminStatus);

module.exports = router;
