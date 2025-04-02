const express = require('express');
const router = express.Router();
const bloodRequestController = require('../controllers/bloodRequestController');

// Route to get all blood requests
router.get('/', bloodRequestController.getAllBloodRequests);

// Route to create a new blood request
router.post('/', bloodRequestController.createBloodRequest);

module.exports = router;