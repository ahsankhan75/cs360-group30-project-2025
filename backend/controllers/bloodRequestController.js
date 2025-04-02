const BloodRequest = require('../models/blood_request');

// Get all blood requests
exports.getAllBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new blood request
exports.createBloodRequest = async (req, res) => {
  const bloodRequest = new BloodRequest({
    requestId: req.body.requestId,
    hospitalName: req.body.hospitalName,
    bloodType: req.body.bloodType,
    urgencyLevel: req.body.urgencyLevel,
    location: req.body.location,
    datePosted: req.body.datePosted,
    unitsNeeded: req.body.unitsNeeded
  });
  
  try {
    const newRequest = await bloodRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};