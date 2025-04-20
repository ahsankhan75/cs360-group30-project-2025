const jwt = require('jsonwebtoken');
const HospitalAdmin = require('../models/hospitalAdminModel');

const requireHospitalAdminAuth = async (req, res, next) => {
  // Verify authentication
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    // Verify token
    const { _id } = jwt.verify(token, process.env.SECRET);

    // Find the hospital admin
    const hospitalAdmin = await HospitalAdmin.findOne({ _id }).select('_id email fullName hospitalId permissions status');
    
    if (!hospitalAdmin) {
      return res.status(404).json({ error: 'Hospital admin not found' });
    }
    
    if (hospitalAdmin.status !== 'approved') {
      return res.status(403).json({ error: 'Your account is pending approval' });
    }
    
    // Attach hospital admin to request
    req.hospitalAdmin = hospitalAdmin;
    next();
  } catch (error) {
    console.error('Hospital admin auth error:', error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = requireHospitalAdminAuth;