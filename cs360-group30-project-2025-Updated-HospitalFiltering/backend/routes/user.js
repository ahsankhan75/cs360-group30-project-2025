const express = require('express')

// controller functions
const { loginUser, signupUser , signupAdmin, loginAdmin} = require('../controllers/userController')

const router = express.Router()

// login route
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)
router.post('/adminSignup', signupAdmin)
router.post('/adminLogin', loginAdmin);
module.exports = router