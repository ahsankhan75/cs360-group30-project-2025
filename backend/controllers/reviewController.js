const Review = require('../models/reviewModel');
const Hospital = require('../models/hospitalModel');
const mongoose = require('mongoose');

// Get all reviews for a specific hospital
const getReviewsByHospital = async (req, res) => {
  const { hospitalId } = req.params;

  try {
    // Validate hospitalId format
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ error: 'Invalid hospital ID format' });
    }
    
    const reviews = await Review.find({ hospitalId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('user', 'fullName') // Only get fullName from user
      .exec();
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new review
const createReview = async (req, res) => {
  const { hospitalId, rating, comment } = req.body;
  const userId = req.user._id;

  try {
    // Validate required fields
    if (!hospitalId || !rating) {
      return res.status(400).json({ error: 'Hospital ID and rating are required' });
    }

    // Validate hospitalId format
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ error: 'Invalid hospital ID format' });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if the hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // Check if user has already reviewed this hospital
    const existingReview = await Review.findOne({ hospitalId, userId });
    
    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
      
      // Populate user data before sending response
      await existingReview.populate('user', 'fullName');
      
      return res.status(200).json(existingReview);
    }

    // Create new review
    const newReview = await Review.create({
      hospitalId,
      userId,
      rating,
      comment
    });

    // Populate user data before sending response
    await newReview.populate('user', 'fullName');

    // Update hospital average rating
    await updateHospitalRating(hospitalId);

    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Helper function to update hospital average rating
const updateHospitalRating = async (hospitalId) => {
  try {
    // Calculate the average rating
    const result = await Review.aggregate([
      { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);
    
    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    
    // Update the hospital rating
    await Hospital.findByIdAndUpdate(hospitalId, { ratings: averageRating });
  } catch (error) {
    console.error('Error updating hospital rating:', error);
  }
};

// Get a list of all hospital names and IDs (for the dropdown)
const getAllHospitalNames = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}, 'name location ratings');
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all reviews by the current user
const getReviewsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('user', 'fullName email')
      .populate({
        path: 'hospitalId',
        select: 'name location.address ratings reviewCount',
        model: 'Hospital'
      })
      .exec();
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  try {
    // Validate reviewId format
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid review ID format' });
    }

    // Find the review
    const review = await Review.findById(reviewId);
    
    // Check if review exists
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns the review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    // Update the review
    review.rating = rating || review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    await review.save();
    
    // Populate user data before sending response
    await review.populate('user', 'fullName');
    
    // Update hospital average rating
    await updateHospitalRating(review.hospitalId);

    res.status(200).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  try {
    // Validate reviewId format
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid review ID format' });
    }

    // Find the review
    const review = await Review.findById(reviewId);
    
    // Check if review exists
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns the review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    // Store hospitalId before deleting
    const hospitalId = review.hospitalId;

    // Delete the review
    await Review.deleteOne({ _id: reviewId });
    
    // Update hospital average rating
    await updateHospitalRating(hospitalId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getReviewsByHospital,
  createReview,
  getAllHospitalNames,
  getReviewsByUser,
  updateReview,
  deleteReview
};
