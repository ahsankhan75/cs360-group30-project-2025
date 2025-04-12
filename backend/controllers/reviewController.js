const Review = require('../models/reviewModel');
const Hospital = require('../models/hospitalModel');
const mongoose = require('mongoose');

// Get all reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .populate('hospitalId', 'name location ratings')
      .populate('userId', 'email');
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get reviews for a hospital
const getReviewsByHospital = async (req, res) => {
  const { hospitalId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(404).json({ error: 'Invalid hospital ID' });
    }

    const reviews = await Review.find({ hospitalId })
      .sort({ createdAt: -1 })
      .populate('userId', 'email');
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get reviews by a user
const getReviewsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 })
      .populate('hospitalId', 'name location ratings');
    
    // Calculate statistics for the user dashboard
    let totalRating = 0;
    reviews.forEach(review => {
      totalRating += review.rating;
    });
    
    const stats = {
      totalReviewCount: reviews.length,
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0
    };
    
    res.status(200).json({
      reviews,
      stats
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(400).json({ error: error.message });
  }
};

// Add a new review
const createReview = async (req, res) => {
  const { hospitalId, rating, comment } = req.body;
  const userId = req.user._id;

  try {
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(404).json({ error: 'Invalid hospital ID' });
    }
    
    // Check if user already reviewed this hospital
    const existingReview = await Review.findOne({ hospitalId, userId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this hospital' });
    }
    
    // Create the review
    const review = await Review.create({
      hospitalId,
      userId,
      rating,
      comment
    });
    
    // Update hospital rating
    await updateHospitalRating(hospitalId);
    
    // Return the populated review
    const populatedReview = await Review.findById(review._id)
      .populate('hospitalId', 'name location ratings')
      .populate('userId', 'email');
    
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  const { id } = req.params; // Make sure this matches the route parameter
  const { rating, comment } = req.body;
  const userId = req.user._id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Invalid review ID' });
    }
    
    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns the review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }
    
    // Update the review - ensure we properly handle both fields
    review.rating = rating !== undefined ? rating : review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    await review.save();
    
    // Update hospital rating
    await updateHospitalRating(review.hospitalId);
    
    // Return the updated review with populated fields
    const updatedReview = await Review.findById(id)
      .populate('hospitalId', 'name location ratings')
      .populate('userId', 'email');
    
    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Invalid review ID' });
    }
    
    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns the review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }
    
    // Save hospital ID before deletion for updating ratings
    const hospitalId = review.hospitalId;
    
    // Delete the review
    await Review.findByIdAndDelete(id);
    
    // Update hospital rating
    await updateHospitalRating(hospitalId);
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all hospital names - for dropdowns, etc.
const getAllHospitalNames = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}, 'name ratings location reviewCount').sort({ name: 1 });
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Helper function to update hospital rating
const updateHospitalRating = async (hospitalId) => {
  try {
    // Get all reviews for the hospital
    const reviews = await Review.find({ hospitalId });
    
    // Calculate average rating
    let totalRating = 0;
    reviews.forEach(review => {
      totalRating += review.rating;
    });
    
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    // Update the hospital
    await Hospital.findByIdAndUpdate(hospitalId, {
      ratings: parseFloat(averageRating.toFixed(1)),
      reviewCount: reviews.length
    });
    
    return true;
  } catch (error) {
    console.error('Error updating hospital rating:', error);
    return false;
  }
};

module.exports = {
  getReviews,
  getReviewsByHospital,
  getReviewsByUser,
  createReview,
  updateReview,
  deleteReview,
  getAllHospitalNames
};
