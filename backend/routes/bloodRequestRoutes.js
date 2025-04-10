const express = require('express');
const router = express.Router();
const bloodRequestController = require('../controllers/bloodRequestController');
const { getSingleBloodRequest, deleteBloodRequest, acceptBloodRequest, getUserBloodRequests } = require('../controllers/bloodRequestController');
const requireAuth = require("../middleware/requireAuth");

// Route to get all blood requests
router.get('/', bloodRequestController.getAllBloodRequests);

// Route to create a new blood request
router.post('/', bloodRequestController.createBloodRequest);

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// Place the /mine route before /:requestId
router.get('/mine', requireAuth, getUserBloodRequests);

// After specific routes, we can have parameterized routes
router.get('/:requestId', getSingleBloodRequest);

const { addMultipleBloodRequests } = require('../controllers/bloodRequestController');

router.post("/multiple", requireAuth, addMultipleBloodRequests);

router.delete('/:requestId', deleteBloodRequest);

router.patch('/:requestId/accept', acceptBloodRequest);

module.exports = router;