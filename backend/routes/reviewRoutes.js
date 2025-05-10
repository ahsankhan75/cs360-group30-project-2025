const express = require('express');
const router = express.Router();
const { 
  getReviews,
  getReviewsByHospital, 
  createReview,
  getAllHospitalNames,
  getReviewsByUser,
  updateReview,
  deleteReview,
  adminDeleteReview,
  adminUpdateReview
} = require('../controllers/reviewController');
const requireAuth = require('../middleware/requireAuth');
const requireAdminAuth = require('../middleware/requireAdminAuth');

// Public routes
router.get('/hospital/:hospitalId', getReviewsByHospital);

// Admin routes
router.get('/admin', requireAdminAuth, getReviews);
router.delete('/admin/:reviewId', requireAdminAuth, adminDeleteReview);
router.patch('/admin/:reviewId', requireAdminAuth, adminUpdateReview);

// Protected routes (require authentication)
router.post('/', requireAuth, createReview);
router.get('/my-reviews', requireAuth, getReviewsByUser);
router.patch('/:id', requireAuth, updateReview);
router.delete('/:reviewId', requireAuth, deleteReview);

module.exports = router;
