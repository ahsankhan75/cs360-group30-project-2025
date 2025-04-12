const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAdminAuth = async (req, res, next) => {
  // Verify authentication
  const { authorization } = req.headers

  if (!authorization) {
    return res.status(401).json({error: 'Authorization token required'})
  }

  const token = authorization.split(' ')[1]

  try {
    // Verify token
    const { _id } = jwt.verify(token, process.env.SECRET)

    // Find the user and check if they're an admin
    const user = await User.findOne({ _id }).select('_id isAdmin adminPermissions')
    
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({error: 'Not authorized as admin'})
    }
    
    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    console.error('Admin auth error:', error)
    res.status(401).json({error: 'Request is not authorized'})
  }
}

module.exports = requireAdminAuth
