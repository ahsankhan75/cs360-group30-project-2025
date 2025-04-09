const express = require('express');
const { getReviews, createReview } = require('../controllers/reviewController');

const router = express.Router();

// GET all reviews or filtered by hospital
router.get('/', getReviews);

// POST a new review
router.post('/', createReview);

module.exports = router;
