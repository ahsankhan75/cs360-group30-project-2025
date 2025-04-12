const express = require('express');
const router = express.Router();
const { 
  getReviewsByHospital, 
  createReview,
  getAllHospitalNames,
  getReviewsByUser,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const requireAuth = require('../middleware/requireAuth');

// Public routes
router.get('/hospital/:hospitalId', getReviewsByHospital);

// Protected routes (require authentication)
router.post('/', requireAuth, createReview);
router.get('/my-reviews', requireAuth, getReviewsByUser);
router.patch('/:id', requireAuth, updateReview);
router.delete('/:reviewId', requireAuth, deleteReview);

module.exports = router;
