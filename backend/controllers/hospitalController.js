const Hospital = require('../models/hospitalModel');
const Review = require('../models/reviewModel');
const mongoose = require('mongoose');

// Get detailed hospital information with reviews
const getHospitalDetails = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Validate hospital ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid hospital ID format' });
    }
    
    // Find hospital
    const hospital = await Hospital.findById(id);
    
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    // Get reviews for this hospital
    const reviews = await Review.find({ hospitalId: id })
      .sort({ createdAt: -1 })
      .populate('user', 'fullName')
      .limit(5); // Limit to 5 most recent reviews
    
    // Calculate review stats
    const reviewStats = await Review.aggregate([
      { $match: { hospitalId: new mongoose.Types.ObjectId(id) } },
      { $group: {
          _id: null,
          totalCount: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }}
    ]);
    
    // Combine hospital data with reviews and stats
    const hospitalData = {
      ...hospital.toObject(),
      reviews,
      reviewStats: reviewStats.length > 0 ? reviewStats[0] : {
        totalCount: 0,
        avgRating: 0,
        rating5: 0,
        rating4: 0,
        rating3: 0,
        rating2: 0,
        rating1: 0
      }
    };
    
    res.status(200).json(hospitalData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this function if it doesn't already exist
const getHospitalById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid hospital ID format' });
  }

  try {
    const hospital = await Hospital.findById(id);
    
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    res.status(200).json(hospital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search hospitals by name or location with pagination
const searchHospitals = async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;
  
  try {
    const queryObject = query
      ? {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { 'location.address': { $regex: query, $options: 'i' } }
          ]
        }
      : {};
    
    const totalHospitals = await Hospital.countDocuments(queryObject);
    const totalPages = Math.ceil(totalHospitals / limit);
    
    // Get hospitals
    const hospitals = await Hospital.find(queryObject)
      .sort({ ratings: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Get review counts for these hospitals
    const hospitalIds = hospitals.map(h => h._id);
    const reviewCounts = await Review.aggregate([
      { $match: { hospitalId: { $in: hospitalIds } } },
      { $group: { _id: '$hospitalId', count: { $sum: 1 } } }
    ]);
    
    // Create a map of hospital ID to review count
    const reviewCountMap = {};
    reviewCounts.forEach(item => {
      reviewCountMap[item._id] = item.count;
    });
    
    // Add review count to each hospital
    const hospitalsWithReviewCount = hospitals.map(hospital => {
      const hospitalObj = hospital.toObject();
      hospitalObj.reviewCount = reviewCountMap[hospital._id] || 0;
      return hospitalObj;
    });
    
    res.status(200).json({
      hospitals: hospitalsWithReviewCount,
      pagination: {
        total: totalHospitals,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add review count to getAllHospitalNames method
const getAllHospitalNames = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}, 'name location ratings');
    
    // Get review counts for all hospitals
    const reviewCounts = await Review.aggregate([
      { $group: { _id: '$hospitalId', count: { $sum: 1 } } }
    ]);
    
    // Create a map of hospital ID to review count
    const reviewCountMap = {};
    reviewCounts.forEach(item => {
      reviewCountMap[item._id] = item.count;
    });
    
    // Add review count to each hospital
    const hospitalsWithReviewCount = hospitals.map(hospital => {
      const hospitalObj = hospital.toObject();
      hospitalObj.reviewCount = reviewCountMap[hospital._id] || 0;
      return hospitalObj;
    });
    
    res.status(200).json(hospitalsWithReviewCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getHospitalDetails,
  searchHospitals,
  getHospitalById,
  getAllHospitalNames
};
