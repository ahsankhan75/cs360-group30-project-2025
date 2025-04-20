const Admin = require('../models/adminModel')
const jwt = require('jsonwebtoken')
const Hospital = require('../models/hospitalModel')
const User = require('../models/userModel')
const Review = require('../models/reviewModel')
const BloodRequest = require('../models/blood_request')
const mongoose = require('mongoose')

// Generate JWT token
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' })
}

// Login admin
const loginAdmin = async (req, res) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields must be filled' })
    }

    // Find user with admin privileges
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ error: 'Admin account not found' })
    }

    // Validate user
    const validUser = await User.login(email, password)

    // Check if user is admin
    if (!validUser.isAdmin) {
      return res.status(403).json({ error: 'Not authorized as admin' })
    }

    // Create token
    const token = createToken(validUser._id)

    res.status(200).json({
      email,
      fullName: validUser.fullName || 'Admin',
      isAdmin: true,
      adminPermissions: validUser.adminPermissions || {
        manageUsers: true,
        manageHospitals: true,
        manageReviews: true,
        manageBloodRequests: true
      },
      token
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(400).json({ error: error.message })
  }
}

// Register a new admin
const signupAdmin = async (req, res) => {
  const { email, password, fullName, confirmPassword, adminSecret } = req.body

  try {
    // Verify admin secret code
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Invalid admin secret code' })
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create a new user with admin privileges
    const user = await User.signup(email, password, fullName)

    // Set admin flag and permissions
    user.isAdmin = true
    user.adminPermissions = {
      manageUsers: true,
      manageHospitals: true,
      manageReviews: true,
      manageBloodRequests: true
    }
    await user.save()

    // Generate JWT token
    const token = createToken(user._id)

    res.status(201).json({
      email,
      fullName: user.fullName,
      isAdmin: true,
      permissions: user.adminPermissions,
      token
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Get statistics for dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Count data for dashboard statistics
    const userCount = await User.countDocuments({ isAdmin: { $ne: true } });
    const hospitalCount = await Hospital.countDocuments();
    const bloodRequestCount = await BloodRequest.countDocuments();
    const reviewCount = await Review.countDocuments();

    // Get recent blood requests
    const recentBloodRequests = await BloodRequest.find()
      .sort({ datePosted: -1 })
      .limit(5);

    // Get recent reviews
    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('hospitalId', 'name')
      .populate('userId', 'email fullName');

    res.status(200).json({
      stats: {
        userCount,
        hospitalCount,
        bloodRequestCount,
        reviewCount
      },
      recentActivity: {
        bloodRequests: recentBloodRequests,
        reviews: recentReviews
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
  }
}

// Manage users - get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: { $ne: true } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// Delete a user
const deleteUser = async (req, res) => {
  const { userId } = req.params

  try {
    const user = await User.findByIdAndDelete(userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Also delete all reviews by this user
    await Review.deleteMany({ userId })

    res.status(200).json({ message: 'User and associated data deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Manage reviews - delete inappropriate reviews
const deleteReview = async (req, res) => {
  const { reviewId } = req.params

  try {
    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }

    // Store hospitalId for rating update
    const hospitalId = review.hospitalId

    // Delete the review
    await Review.findByIdAndDelete(reviewId)

    // Update hospital rating
    await updateHospitalRating(hospitalId)

    res.status(200).json({ message: 'Review deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Update hospital rating helper function
const updateHospitalRating = async (hospitalId) => {
  try {
    // Get all reviews for the hospital
    const reviews = await Review.find({ hospitalId })

    // Calculate average rating
    let totalRating = 0
    reviews.forEach(review => {
      totalRating += review.rating
    })

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    // Update the hospital
    await Hospital.findByIdAndUpdate(hospitalId, {
      ratings: parseFloat(averageRating.toFixed(1)),
      reviewCount: reviews.length
    })

    return true
  } catch (error) {
    console.error('Error updating hospital rating:', error)
    return false
  }
}

// Get blood requests with filtering options
const getBloodRequests = async (req, res) => {
  try {
    const { status, bloodType, location } = req.query

    // Build filter object based on query parameters
    const filter = {}
    if (status === 'pending') filter.accepted = false
    if (status === 'accepted') filter.accepted = true
    if (bloodType) filter.bloodType = bloodType
    if (location) filter.location = new RegExp(location, 'i') // case-insensitive search

    const requests = await BloodRequest.find(filter).sort({ datePosted: -1 })
    res.status(200).json(requests)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Update blood request status
const updateBloodRequest = async (req, res) => {
  const { requestId } = req.params
  const { accepted } = req.body

  try {
    const request = await BloodRequest.findOneAndUpdate(
      { requestId },
      { accepted },
      { new: true }
    )

    if (!request) {
      return res.status(404).json({ error: 'Blood request not found' })
    }

    res.status(200).json(request)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Get hospital management data
const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ name: 1 })
    res.status(200).json(hospitals)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Add a new hospital
const addHospital = async (req, res) => {
  const { name, location, facilities } = req.body

  try {
    const hospital = await Hospital.create({
      name,
      location,
      facilities,
      ratings: 0,
      reviewCount: 0
    })

    res.status(201).json(hospital)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Update hospital information
const updateHospital = async (req, res) => {
  const { hospitalId } = req.params
  const { name, location, facilities } = req.body

  try {
    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { name, location, facilities },
      { new: true }
    )

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' })
    }

    res.status(200).json(hospital)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Delete hospital
const deleteHospital = async (req, res) => {
  const { hospitalId } = req.params

  try {
    const hospital = await Hospital.findByIdAndDelete(hospitalId)

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' })
    }

    // Also delete all reviews for this hospital
    await Review.deleteMany({ hospitalId })

    res.status(200).json({ message: 'Hospital and associated reviews deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  signupAdmin,
  loginAdmin,
  getDashboardStats,
  getAllUsers,
  deleteUser,
  deleteReview,
  getBloodRequests,
  updateBloodRequest,
  getHospitals,
  addHospital,
  updateHospital,
  deleteHospital
}
