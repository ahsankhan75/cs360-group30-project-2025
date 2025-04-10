const express = require('express');
const router = express.Router();
const { 
  getReviewsByHospital, 
  createReview,
  getAllHospitalNames
} = require('../controllers/reviewController');
const requireAuth = require('../middleware/requireAuth');

// Public routes
router.get('/hospital/:hospitalId', getReviewsByHospital);

// Protected routes (require authentication)
router.post('/', requireAuth, createReview);

// Add this route if it doesn't already exist
router.get('/:id', getHospitalById);

module.exports = router;