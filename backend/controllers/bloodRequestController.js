// // const BloodRequest = require('../models/blood_request');

// // // Get all blood requests
// // exports.getAllBloodRequests = async (req, res) => {
// //   try {
// //     const requests = await BloodRequest.find();
// //     res.json(requests);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // // Create a new blood request
// // exports.createBloodRequest = async (req, res) => {
// //   const bloodRequest = new BloodRequest({
// //     requestId: req.body.requestId,
// //     hospitalName: req.body.hospitalName,
// //     bloodType: req.body.bloodType,
// //     urgencyLevel: req.body.urgencyLevel,
// //     location: req.body.location,
// //     datePosted: req.body.datePosted,
// //     unitsNeeded: req.body.unitsNeeded
// //   });
  
// //   try {
// //     const newRequest = await bloodRequest.save();
// //     res.status(201).json(newRequest);
// //   } catch (error) {
// //     res.status(400).json({ message: error.message });
// //   }
// // };

// // const getSingleBloodRequest = async (req, res) => {
// //   const { requestId } = req.params;

// //   try {
// //     const request = await BloodRequest.findOne({ requestId });

// //     if (!request) {
// //       return res.status(404).json({ error: 'Blood request not found' });
// //     }

// //     res.status(200).json(request);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // };

// // module.exports = { getSingleBloodRequest };


// const BloodRequest = require('../models/blood_request');

// // Get all blood requests
// const getAllBloodRequests = async (req, res) => {
//   try {
//     const requests = await BloodRequest.find();
//     res.json(requests);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Create a new blood request
// const createBloodRequest = async (req, res) => {
//   const bloodRequest = new BloodRequest({
//     requestId: req.body.requestId,
//     hospitalName: req.body.hospitalName,
//     bloodType: req.body.bloodType,
//     urgencyLevel: req.body.urgencyLevel,
//     location: req.body.location,
//     datePosted: req.body.datePosted,
//     unitsNeeded: req.body.unitsNeeded,
//     contactNumber: req.body.contactNumber || '',
//     email: req.body.email || '',
//     latitude: req.body.latitude || null,
//     longitude: req.body.longitude || null
//   });

//   try {
//     const newRequest = await bloodRequest.save();
//     res.status(201).json(newRequest);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // Get a single blood request by requestId
// const getSingleBloodRequest = async (req, res) => {
//   const { requestId } = req.params;

//   try {
//     const request = await BloodRequest.findOne({ requestId });

//     if (!request) {
//       return res.status(404).json({ error: 'Blood request not found' });
//     }

//     res.status(200).json(request);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const addMultipleBloodRequests = async (req, res) => {
//   try {
//     const requests = req.body; // Expecting an array of requests
//     const saved = await BloodRequest.insertMany(requests, { ordered: false });
//     res.status(201).json(saved);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // Export all handlers
// module.exports = {
//   getAllBloodRequests,
//   createBloodRequest,
//   getSingleBloodRequest,
//   addMultipleBloodRequests
// };

const BloodRequest = require('../models/blood_request');

// Get all blood requests
const getAllBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new blood request
const createBloodRequest = async (req, res) => {
  const bloodRequest = new BloodRequest({
    requestId: req.body.requestId,
    hospitalName: req.body.hospitalName,
    bloodType: req.body.bloodType,
    urgencyLevel: req.body.urgencyLevel,
    location: req.body.location,
    datePosted: req.body.datePosted,
    unitsNeeded: req.body.unitsNeeded,
    contactNumber: req.body.contactNumber || '',
    email: req.body.email || '',
    latitude: req.body.latitude || null,
    longitude: req.body.longitude || null
  });

  try {
    const newRequest = await bloodRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single blood request by requestId
const getSingleBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findOne({ requestId: req.params.requestId });

    if (!request) {
      return res.status(404).json({ error: 'Blood request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add multiple blood requests
const addMultipleBloodRequests = async (req, res) => {
  try {
    const requests = req.body; // Array of blood request objects
    const saved = await BloodRequest.insertMany(requests, { ordered: false });
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a request by requestId
const deleteBloodRequest = async (req, res) => {
  try {
    const deleted = await BloodRequest.findOneAndDelete({ requestId: req.params.requestId });

    if (!deleted) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({ message: 'Request deleted successfully', deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all handlers
module.exports = {
  getAllBloodRequests,
  createBloodRequest,
  getSingleBloodRequest,
  addMultipleBloodRequests,
  deleteBloodRequest
};