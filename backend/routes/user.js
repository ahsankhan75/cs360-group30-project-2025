const express = require('express')
const { loginUser, signupUser, loginAdmin, signupAdmin, refreshToken, forgotPassword, resetPassword, verifyEmail } = require('../controllers/userController')

const router = express.Router()

// Public routes
router.post('/signup', signupUser)
router.post('/login', loginUser)

// refresh token route
router.post('/refresh-token', refreshToken)

// forgot password route
router.post('/forgot-password', forgotPassword)

// reset password route
router.post('/reset-password/:token', resetPassword)

// verify email route
router.get('/verify-email/:token', verifyEmail)

// Admin routes
router.post('/admin-login', loginAdmin)
router.post('/admin-signup', signupAdmin)

module.exports = router