const User = require('../models/userModel');

const requireAdmin = async (req, res, next) => {
  try {
    // Check if the user is set by the requireAuth middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Find the user to check admin status
    const user = await User.findById(req.user._id);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ error: 'Server error during admin authorization' });
  }
};

module.exports = requireAdmin;
