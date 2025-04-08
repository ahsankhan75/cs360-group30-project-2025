const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const createToken = (_id) => {
    return jwt.sign({ _id: _id }, process.env.SECRET, { expiresIn: '3d' })
}

// login a user
const loginUser = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.login(email, password)
        const token = createToken(user._id)
        res.status(200).json({ email, token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// signup a user
const signupUser = async (req, res) => {
    const { fullName, email, password, confirmPassword } = req.body

    try {
        const user = await User.signup(fullName, email, password, confirmPassword)
        const token = createToken(user._id)
        res.status(200).json({ email, token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const signupAdmin = async (req, res) => {
    const { fullName, email, password, confirmPassword, adminId } = req.body
  
    try {
      // Call the new static method that does all the admin checks and inserts into the admins collection
      const dbResult = await User.signupAsAdmin(fullName, email, password, confirmPassword, adminId)
  
      // dbResult.insertedId contains the ObjectId of the newly inserted admin document.
      const token = createToken(dbResult.insertedId)
      res.status(200).json({ email, token })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }
  
  // Add this new function in your file, for example below loginUser
  const loginAdmin = async (req, res) => {
      const { email, password } = req.body;
      try {
        const admin = await User.adminLogin(email, password);
        const token = createToken(admin._id);
        res.status(200).json({ email, token });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }

module.exports = { signupUser, loginUser , signupAdmin, loginAdmin}