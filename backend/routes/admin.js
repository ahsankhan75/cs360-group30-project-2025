const express = require('express');
const router = express.Router();
const requireAdminAuth = require('../middleware/requireAdminAuth');
const { loginAdmin, signupAdmin, adminForgotPassword, resetPassword, verifyEmail } = require('../controllers/userController');
const { getDashboardStats, getAllUsers, getHospitals, addHospital, deleteHospital, deleteUser } = require('../controllers/adminController');
const { getPendingHospitalAdmins, updateHospitalAdminStatus } = require('../controllers/hospitalAdminController');

// Public admin routes
router.post('/login', loginAdmin);
router.post('/signup', signupAdmin);
router.post('/forgot-password', adminForgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Admin API is available',
    time: new Date().toISOString() 
  });
});

// Protected admin routes
router.get('/dashboard', requireAdminAuth, getDashboardStats);
router.get('/users', requireAdminAuth, getAllUsers);
router.delete('/users/:userId', requireAdminAuth, deleteUser);

// Hospital management routes
router.get('/hospitals', requireAdminAuth, getHospitals);
router.post('/hospitals', requireAdminAuth, addHospital);
router.delete('/hospitals/:id', requireAdminAuth, deleteHospital);

// Hospital admin management routes
router.get('/hospital-admins/pending', requireAdminAuth, getPendingHospitalAdmins);
router.patch('/hospital-admins/:id/status', requireAdminAuth, updateHospitalAdminStatus);

module.exports = router;
