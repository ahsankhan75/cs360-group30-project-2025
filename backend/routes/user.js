const express = require('express')

// controller functions
const { loginUser, signupUser, loginAdmin, signupAdmin, refreshToken } = require('../controllers/userController')

const router = express.Router()

// login route
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)

// Refresh token route
router.post('/refresh-token', refreshToken)

// Admin routes
router.post('/adminLogin', loginAdmin)
router.post('/adminSignup', signupAdmin)

module.exports = router