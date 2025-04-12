const express = require('express')

// controller functions
const { loginUser, signupUser, loginAdmin, signupAdmin } = require('../controllers/userController')

const router = express.Router()

// login route
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)

// Admin routes
router.post('/adminLogin', loginAdmin)
router.post('/adminSignup', signupAdmin)

module.exports = router