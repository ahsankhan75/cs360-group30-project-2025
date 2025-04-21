const BloodRequest = require('../models/blood_request');
const requireAuth = require("../middleware/requireAuth");

// Get all blood requests
const getAllBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find();
    
    // Enhanced city coordinates lookup with more cities
    const cityCoordinates = {
      'Lahore': { lat: 31.5204, lon: 74.3587 },
      'Karachi': { lat: 24.8607, lon: 67.0011 },
      'Islamabad': { lat: 33.6844, lon: 73.0479 },
      'Rawalpindi': { lat: 33.5651, lon: 73.0169 },
      'Faisalabad': { lat: 31.4504, lon: 73.135 },
      'Multan': { lat: 30.1575, lon: 71.5249 },
      'Peshawar': { lat: 34.0151, lon: 71.5249 },
      'Quetta': { lat: 30.1798, lon: 66.975 },
      'Sialkot': { lat: 32.4945, lon: 74.5229 },
      'Gujranwala': { lat: 32.1877, lon: 74.1945 },
      'Bahawalpur': { lat: 29.3956, lon: 71.6836 },
      'Hyderabad': { lat: 25.396, lon: 68.3578 },
      'Sukkur': { lat: 27.7052, lon: 68.8574 },
      'Abbottabad': { lat: 34.1463, lon: 73.2117 },
      'Mardan': { lat: 34.1982, lon: 72.0459 }
    };
    
    // Add fallback location data for any requests missing coordinates
    const enhancedRequests = requests.map(request => {
      const reqObject = request.toObject ? request.toObject() : request;
      
      // If latitude or longitude is missing, try to get it from city data
      if (!reqObject.latitude || !reqObject.longitude) {
        // Extract city name from location
        let cityName = null;
        
        if (reqObject.location) {
          // Try to extract the first part before any comma or other delimiter
          const locationParts = reqObject.location.split(/[,\-–]/);
          if (locationParts.length > 0) {
            cityName = locationParts[0].trim();
          }
          
          // Check if we can find this city in our coordinates list
          const cityMatch = Object.keys(cityCoordinates).find(
            city => cityName && cityName.toLowerCase().includes(city.toLowerCase())
          );
          
          if (cityMatch) {
            reqObject.latitude = cityCoordinates[cityMatch].lat;
            reqObject.longitude = cityCoordinates[cityMatch].lon;
          } else if (cityName) {
            // Direct match by city name
            if (cityCoordinates[cityName]) {
              reqObject.latitude = cityCoordinates[cityName].lat;
              reqObject.longitude = cityCoordinates[cityName].lon;
            }
          }
        }
      }
      
      return reqObject;
    });
    
    res.json(enhancedRequests);
  } catch (error) {
    console.error("Error fetching blood requests:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get coordinates for known cities
function getCityCoordinates(locationName) {
  const cityCoordinates = {
    'Lahore': { lat: 31.5204, lon: 74.3587 },
    'Karachi': { lat: 24.8607, lon: 67.0011 },
    'Islamabad': { lat: 33.6844, lon: 73.0479 },
    'Rawalpindi': { lat: 33.5651, lon: 73.0169 },
    'Faisalabad': { lat: 31.4504, lon: 73.135 },
    'Multan': { lat: 30.1575, lon: 71.5249 },
    'Peshawar': { lat: 34.0151, lon: 71.5249 },
    'Quetta': { lat: 30.1798, lon: 66.975 },
    // ... add other cities as needed
  };
  
  if (!locationName) return null;
  
  // Check direct match
  if (cityCoordinates[locationName]) {
    return cityCoordinates[locationName];
  }
  
  // Check for partial matches
  const cityName = Object.keys(cityCoordinates).find(city => 
    locationName.toLowerCase().includes(city.toLowerCase())
  );
  
  return cityName ? cityCoordinates[cityName] : null;
}

// Create a new blood request
const createBloodRequest = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Log the incoming request body

    // Validate and convert hospitalId to ObjectId if provided
    let hospitalId = null;
    if (req.body.hospitalId) {
      console.log('Validating hospitalId:', req.body.hospitalId); // Log the hospitalId being validated
      if (!mongoose.Types.ObjectId.isValid(req.body.hospitalId)) {
        console.error('Invalid hospital ID:', req.body.hospitalId); // Log invalid hospitalId
        return res.status(400).json({ message: 'Invalid hospital ID' });
      }
      hospitalId = new mongoose.Types.ObjectId(req.body.hospitalId); // Correct usage of ObjectId
      console.log('Converted hospitalId to ObjectId:', hospitalId); // Log the converted ObjectId
    }

    // Create a new blood request
    const bloodRequest = new BloodRequest({
      requestId: req.body.requestId,
      hospitalId, // Use the validated and converted ObjectId
      hospitalName: req.body.hospitalName,
      bloodType: req.body.bloodType,
      urgencyLevel: req.body.urgencyLevel,
      location: req.body.location,
      datePosted: req.body.datePosted,
      unitsNeeded: req.body.unitsNeeded,
      contactNumber: req.body.contactNumber || '',
      email: req.body.email || '',
      latitude: req.body.latitude || null,
      longitude: req.body.longitude || null,
    });

    const newRequest = await bloodRequest.save();
    console.log('Blood request created successfully:', newRequest); // Log the created blood request
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating blood request:', error.message); // Log the error message
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

const addMultipleBloodRequests = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const requests = req.body;

    const requestsWithEmail = requests.map((request) => ({
      ...request,
      email: userEmail,
    }));

    const saved = await BloodRequest.insertMany(requestsWithEmail, { ordered: false });
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

// Accept a blood request
const acceptBloodRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;
    
    // Find the request first
    const request = await BloodRequest.findOne({ requestId });
    
    if (!request) {
      return res.status(404).json({ error: 'Blood request not found' });
    }
    
    // Check if already accepted
    if (request.accepted) {
      return res.status(400).json({ error: 'This request has already been accepted' });
    }
    
    // Update the request
    request.accepted = true;
    request.acceptedBy = userId;
    request.acceptedAt = new Date();
    
    await request.save();
    
    res.json(request);
  } catch (error) {
    console.error("Error accepting blood request:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all blood requests for the current user
const getUserBloodRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const acceptedRequests = await BloodRequest.find({ acceptedBy: userId });
    res.json(acceptedRequests);
  } catch (error) {
    console.error("Error fetching user's blood requests:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get requests accepted by the current user
const getAcceptedBloodRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const acceptedRequests = await BloodRequest.find({ 
      acceptedBy: userId,
      accepted: true
    });
    res.json(acceptedRequests);
  } catch (error) {
    console.error("Error fetching accepted blood requests:", error);
    res.status(500).json({ error: error.message });
  }
};

// Export all handlers
module.exports = {
  getAllBloodRequests,
  createBloodRequest,
  getSingleBloodRequest,
  addMultipleBloodRequests,
  deleteBloodRequest,
  acceptBloodRequest,
  getUserBloodRequests,
  getAcceptedBloodRequests  // Add this new export
};