const express = require('express');
const router = express.Router();
const bloodRequestController = require('../controllers/bloodRequestController');
const { getSingleBloodRequest } = require('../controllers/bloodRequestController');
const { deleteBloodRequest } = require('../controllers/bloodRequestController');

// Route to get all blood requests
router.get('/', bloodRequestController.getAllBloodRequests);

// Route to create a new blood request
router.post('/', bloodRequestController.createBloodRequest);

router.get('/:requestId', getSingleBloodRequest);

const { addMultipleBloodRequests } = require('../controllers/bloodRequestController');

router.post('/batch', addMultipleBloodRequests);

router.delete('/:requestId', deleteBloodRequest);

module.exports = router;