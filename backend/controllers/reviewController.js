const Review = require('../models/reviewModel');
const Hospital = require('../models/hospitalModel');
const mongoose = require('mongoose');

// Get all reviews or filter by hospital
const getReviews = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    
    let query = {};
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }
    
    // Get reviews with populated hospital data
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 }) // newest first
      .populate('hospitalId', 'name');
      
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(400).json({ error: error.message });
  }
};

// Create a new review
const createReview = async (req, res) => {
  const { hospitalId, reviewerName, rating, comment } = req.body;
  
  // Validate inputs
  if (!hospitalId) {
    return res.status(400).json({ error: 'Hospital ID is required' });
  }
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ error: 'Review comment is required' });
  }
  
  try {
    // Verify hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    // Create new review
    const newReview = await Review.create({
      hospitalId,
      reviewerName: reviewerName || 'Anonymous',
      rating,
      comment
    });
    
    // After creating the review, update the hospital's average rating
    await updateHospitalRating(hospitalId);
    
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({ error: error.message });
  }
};

// Helper function to update hospital rating based on reviews
const updateHospitalRating = async (hospitalId) => {
  try {
    const reviews = await Review.find({ hospitalId });
    
    // Calculate average rating if there are reviews
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      // Update hospital rating
      await Hospital.findByIdAndUpdate(hospitalId, {
        ratings: parseFloat(averageRating.toFixed(1))
      });
    }
  } catch (error) {
    console.error('Error updating hospital rating:', error);
  }
};

module.exports = {
  getReviews,
  createReview
};