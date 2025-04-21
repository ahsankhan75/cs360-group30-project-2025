const express = require('express');
const router = express.Router();
const bloodRequestController = require('../controllers/bloodRequestController');
const { getSingleBloodRequest, deleteBloodRequest, acceptBloodRequest, getUserBloodRequests, getAcceptedBloodRequests } = require('../controllers/bloodRequestController');
const requireAuth = require("../middleware/requireAuth");
const requireAdminAuth = require("../middleware/requireAdminAuth");
const requireHospitalAdminAuth = require("../middleware/requireHospitalAdminAuth");

// More specific routes should go first
// User routes - regular users can accept requests and view their accepted requests
router.get('/accepted', requireAuth, getAcceptedBloodRequests);
router.get('/mine', requireAuth, getUserBloodRequests);

// Public routes - anyone can view blood requests
router.get('/', bloodRequestController.getAllBloodRequests);

// Admin-only routes - only admins can create, update, and delete requests
router.post('/', requireAdminAuth, bloodRequestController.createBloodRequest);
router.post("/multiple", requireHospitalAdminAuth, bloodRequestController.addMultipleBloodRequests);

// Dynamic routes with parameters go last
router.get('/:requestId', getSingleBloodRequest);
router.patch('/:requestId/accept', requireAuth, acceptBloodRequest);
router.delete('/:requestId', requireAdminAuth, deleteBloodRequest);

module.exports = router;