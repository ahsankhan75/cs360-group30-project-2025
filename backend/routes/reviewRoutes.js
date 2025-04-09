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

module.exports = router;
