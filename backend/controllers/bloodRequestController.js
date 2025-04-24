const BloodRequest = require('../models/blood_request');
const MedicalCard = require('../models/medicalCardModel');
const DigitalMedicalCard = require('../models/digital_medical_card');
const AcceptedBloodRequest = require('../models/acceptedBloodRequest');
const User = require('../models/userModel');
const requireAuth = require("../middleware/requireAuth");

// Get all blood requests
const getAllBloodRequests = async (req, res) => {
  console.log('Fetching all blood requests');

  try {
    // Check if the BloodRequest model is properly defined
    if (!BloodRequest || typeof BloodRequest.find !== 'function') {
      console.error('BloodRequest model is not properly defined');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Blood request model is not properly configured'
      });
    }

    // Use a simple query with a timeout
    const requests = await BloodRequest.find({}).lean().maxTimeMS(5000).exec();
    console.log(`Found ${requests.length} blood requests`);

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

    // Send a more detailed error response
    res.status(500).json({
      message: error.message || 'Unknown server error',
      error: 'Failed to fetch blood requests. Please try again later.',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });

    // Log additional debugging information
    console.error('Request details:', {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });
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
    console.log(`Fetching blood request with ID: ${req.params.requestId}`);
    const request = await BloodRequest.findOne({ requestId: req.params.requestId }).lean().exec();

    if (!request) {
      console.log(`Blood request with ID ${req.params.requestId} not found`);
      return res.status(404).json({ error: 'Blood request not found' });
    }

    console.log(`Found blood request: ${request.requestId}`);
    res.status(200).json(request);
  } catch (error) {
    console.error(`Error fetching blood request ${req.params.requestId}:`, error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to fetch blood request details. Please try again later.'
    });
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

// Accept a blood request (user side)
const acceptBloodRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    // Find the request first
    const request = await BloodRequest.findOne({ requestId });
    console.log('Found request for user acceptance:', request);

    if (!request) {
      return res.status(404).json({ error: 'Blood request not found' });
    }

    // Check if already accepted by any user
    if (request.userAccepted) {
      return res.status(400).json({ error: 'This request has already been accepted by a user' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has a medical card (either legacy or digital)
    const legacyMedicalCard = await MedicalCard.findOne({ userId });
    const digitalMedicalCard = await DigitalMedicalCard.findOne({ email: user.email });

    let medicalCardInfo = null;

    if (!legacyMedicalCard && !digitalMedicalCard) {
      console.log(`User ${userId} (${user.email}) does not have any medical card`);
      // We'll still allow the acceptance, but log it for debugging
    } else {
      console.log(`User ${userId} has a medical card: ${legacyMedicalCard ? 'Legacy' : 'Digital'}`);

      // Extract medical card info from either legacy or digital card
      if (legacyMedicalCard) {
        medicalCardInfo = {
          name: legacyMedicalCard.name || user.fullName || user.email,
          email: user.email,
          dateOfBirth: legacyMedicalCard.dateOfBirth,
          age: legacyMedicalCard.age,
          gender: legacyMedicalCard.gender,
          userContactNumber: legacyMedicalCard.userContactNumber,
          bloodType: legacyMedicalCard.bloodType,
          organDonor: legacyMedicalCard.organDonor,
          allergies: legacyMedicalCard.allergies,
          currentMedications: legacyMedicalCard.currentMedications,
          medicalDevicesImplants: legacyMedicalCard.medicalDevicesImplants,
          recentSurgeryHospitalization: legacyMedicalCard.recentSurgeryHospitalization,
          dietaryRestrictions: legacyMedicalCard.dietaryRestrictions,
          primaryEmergencyContact: legacyMedicalCard.primaryEmergencyContact,
          secondaryEmergencyContact: legacyMedicalCard.secondaryEmergencyContact,
          insurance: legacyMedicalCard.insurance,
          primaryPhysician: legacyMedicalCard.primaryPhysician,
          lastUpdated: legacyMedicalCard.updatedAt || new Date()
        };
      } else if (digitalMedicalCard) {
        medicalCardInfo = {
          name: digitalMedicalCard.name || user.fullName || user.email,
          email: user.email,
          dateOfBirth: digitalMedicalCard.dateOfBirth,
          age: digitalMedicalCard.age,
          gender: digitalMedicalCard.gender,
          userContactNumber: digitalMedicalCard.userContactNumber,
          bloodType: digitalMedicalCard.bloodType,
          organDonor: digitalMedicalCard.organDonor,
          allergies: digitalMedicalCard.allergies,
          currentMedications: digitalMedicalCard.currentMedications,
          medicalDevicesImplants: digitalMedicalCard.medicalDevicesImplants,
          recentSurgeryHospitalization: digitalMedicalCard.recentSurgeryHospitalization,
          dietaryRestrictions: digitalMedicalCard.dietaryRestrictions,
          primaryEmergencyContact: digitalMedicalCard.primaryEmergencyContact,
          secondaryEmergencyContact: digitalMedicalCard.secondaryEmergencyContact,
          insurance: digitalMedicalCard.insurance,
          primaryPhysician: digitalMedicalCard.primaryPhysician,
          lastUpdated: digitalMedicalCard.updatedAt || new Date()
        };
      }
    }

    // Update the request with user acceptance
    request.userAccepted = true;
    request.acceptedBy = userId;
    request.acceptedAt = new Date();
    request.acceptedByName = user.fullName || user.email;
    request.hospitalApproved = 'pending'; // Reset to pending for hospital approval

    // For backward compatibility
    request.accepted = false; // Will be set to true only after hospital approval

    console.log('Updated request with user acceptance:', request);

    await request.save();

    // Create a new entry in the AcceptedBloodRequest collection
    if (medicalCardInfo) {
      const acceptedRequest = new AcceptedBloodRequest({
        requestId: request.requestId,
        bloodRequestId: request._id,
        userId: userId,
        hospitalName: request.hospitalName,
        acceptedAt: new Date(),
        status: 'pending',
        medicalCardInfo: medicalCardInfo
      });

      await acceptedRequest.save();
      console.log('Created new accepted blood request with medical card info');
    } else {
      console.log('No medical card info available to save with accepted request');
    }

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
      userAccepted: true // Show all user-accepted requests regardless of hospital approval status
    }).sort({ acceptedAt: -1 });
    res.json(acceptedRequests);
  } catch (error) {
    console.error("Error fetching accepted blood requests:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get pending user acceptances for a hospital
const getPendingUserAcceptances = async (req, res) => {
  try {
    const hospitalId = req.hospitalAdmin.hospitalId;

    // Find blood requests for this hospital that have been accepted by users but not yet approved/rejected by hospital
    const pendingRequests = await BloodRequest.find({
      hospitalId: hospitalId,
      userAccepted: true,
      hospitalApproved: 'pending'
    }).populate('acceptedBy', 'email fullName profilePicture');

    console.log('Found pending requests:', pendingRequests);

    res.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending user acceptances:", error);
    res.status(500).json({ error: error.message });
  }
};

// Approve or reject a user's blood request acceptance
const approveRejectUserAcceptance = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, rejectionReason } = req.body;
    const hospitalId = req.hospitalAdmin.hospitalId;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be either "approve" or "reject"' });
    }

    // Find the request
    const request = await BloodRequest.findOne({
      requestId,
      hospitalId
    }).populate('acceptedBy', 'email fullName profilePicture');

    console.log('Found request for approval/rejection:', request);

    if (!request) {
      return res.status(404).json({ error: 'Blood request not found or does not belong to your hospital' });
    }

    // Check if it's been accepted by a user
    if (!request.userAccepted) {
      return res.status(400).json({ error: 'This request has not been accepted by any user yet' });
    }

    // Check if it's already been approved/rejected
    if (request.hospitalApproved !== 'pending') {
      return res.status(400).json({ error: `This request has already been ${request.hospitalApproved}` });
    }

    // Update the request
    request.hospitalApproved = action === 'approve' ? 'approved' : 'rejected';
    request.hospitalApprovedAt = new Date();

    if (action === 'reject' && rejectionReason) {
      request.hospitalRejectionReason = rejectionReason;
    }

    // For backward compatibility
    request.accepted = action === 'approve';

    await request.save();

    // Also update the AcceptedBloodRequest collection
    try {
      const acceptedRequest = await AcceptedBloodRequest.findOne({ requestId });

      if (acceptedRequest) {
        acceptedRequest.status = action === 'approve' ? 'approved' : 'rejected';
        await acceptedRequest.save();
        console.log(`Updated AcceptedBloodRequest status to ${acceptedRequest.status}`);
      } else {
        console.log('No AcceptedBloodRequest found to update status');
      }
    } catch (err) {
      console.error('Error updating AcceptedBloodRequest status:', err);
      // Don't fail the main request if this update fails
    }

    res.json(request);
  } catch (error) {
    console.error("Error approving/rejecting blood request:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get user medical card for a blood request
const getUserMedicalCard = async (req, res) => {
  try {
    const { requestId } = req.params;
    const hospitalId = req.hospitalAdmin.hospitalId;

    console.log(`Fetching medical card for request ${requestId} from hospital ${hospitalId}`);

    // First, try to find the accepted request with medical card info
    const acceptedRequest = await AcceptedBloodRequest.findOne({ requestId }).lean();

    if (acceptedRequest && acceptedRequest.medicalCardInfo) {
      console.log('Found accepted blood request with medical card info');
      return res.json(acceptedRequest.medicalCardInfo);
    }

    console.log('No accepted request found with medical card info, falling back to legacy method');

    // Find the request
    const request = await BloodRequest.findOne({
      requestId,
      hospitalId
    }).populate('acceptedBy', 'email fullName');

    if (!request) {
      console.log('Blood request not found');
      return res.status(404).json({ error: 'Blood request not found or does not belong to your hospital' });
    }

    console.log('Found blood request:', request);

    // Check if it's been accepted by a user
    if (!request.userAccepted) {
      console.log('Request not accepted by any user');
      return res.status(400).json({ error: 'This request has not been accepted by any user yet' });
    }

    if (!request.acceptedBy) {
      console.log('No acceptedBy field found in the request');
      return res.status(400).json({ error: 'No user information found for this request' });
    }

    // Get the user ID
    const userId = request.acceptedBy._id || request.acceptedBy;
    console.log('Looking for medical card for user ID:', userId);

    // Try to get the user's medical card from both models
    let medicalCard = await MedicalCard.findOne({ userId });
    console.log('Legacy medical card found:', medicalCard ? 'Yes' : 'No');

    // If no medical card found, try to find the user and check for digital medical card
    if (!medicalCard) {
      let user = null;
      let userEmail = null;

      // Try to get user email from request
      if (request.acceptedBy && request.acceptedBy.email) {
        userEmail = request.acceptedBy.email;
        console.log('Found email in request:', userEmail);
      }

      // If we have an email, try to find the digital medical card directly
      if (userEmail) {
        const digitalCard = await DigitalMedicalCard.findOne({ email: userEmail });
        console.log('Digital medical card found by email:', digitalCard ? 'Yes' : 'No');

        if (digitalCard) {
          // Convert digital card format to match the expected format
          const formattedCard = {
            ...digitalCard.toObject(),
            userId: userId,
            name: digitalCard.name || userEmail,
            email: userEmail,
            lastUpdated: digitalCard.updatedAt || new Date()
          };

          // Save this information to the AcceptedBloodRequest collection for future use
          try {
            await AcceptedBloodRequest.findOneAndUpdate(
              { requestId },
              {
                requestId: request.requestId,
                bloodRequestId: request._id,
                userId: userId,
                hospitalName: request.hospitalName,
                acceptedAt: request.acceptedAt || new Date(),
                status: request.hospitalApproved || 'pending',
                medicalCardInfo: formattedCard
              },
              { upsert: true, new: true }
            );
            console.log('Updated AcceptedBloodRequest with medical card info');
          } catch (err) {
            console.error('Error saving to AcceptedBloodRequest:', err);
          }

          return res.json(formattedCard);
        }
      }

      // Try to find user by ID or email
      if (!user && request.acceptedBy.email) {
        console.log('Trying to find user by email:', request.acceptedBy.email);
        user = await User.findOne({ email: request.acceptedBy.email });
      }

      if (!user && typeof request.acceptedBy === 'string') {
        console.log('Trying to find user by ID:', request.acceptedBy);
        user = await User.findById(request.acceptedBy);
      }

      // If we found the user, try to find their medical card again
      if (user) {
        console.log('User found:', user.email);

        // Try legacy medical card again with user ID
        medicalCard = await MedicalCard.findOne({ userId: user._id });

        // If still no medical card, try digital medical card
        if (!medicalCard) {
          const digitalCard = await DigitalMedicalCard.findOne({ email: user.email });

          if (digitalCard) {
            console.log('Digital medical card found for user:', user.email);

            // Convert digital card format to match the expected format
            const formattedCard = {
              ...digitalCard.toObject(),
              userId: user._id,
              name: digitalCard.name || user.fullName || user.email,
              email: user.email,
              lastUpdated: digitalCard.updatedAt || new Date()
            };

            // Save this information to the AcceptedBloodRequest collection for future use
            try {
              await AcceptedBloodRequest.findOneAndUpdate(
                { requestId },
                {
                  requestId: request.requestId,
                  bloodRequestId: request._id,
                  userId: userId,
                  hospitalName: request.hospitalName,
                  acceptedAt: request.acceptedAt || new Date(),
                  status: request.hospitalApproved || 'pending',
                  medicalCardInfo: formattedCard
                },
                { upsert: true, new: true }
              );
              console.log('Updated AcceptedBloodRequest with medical card info');
            } catch (err) {
              console.error('Error saving to AcceptedBloodRequest:', err);
            }

            return res.json(formattedCard);
          }

          // No medical card found for this user
          console.log('No medical card found for user:', user.email);
          return res.status(404).json({
            error: 'This user has not created a medical card yet. Please ask them to complete their medical information.'
          });
        }
      } else {
        // No user found
        return res.status(404).json({ error: 'User not found or medical card information is missing' });
      }
    }

    // If we found a legacy medical card, save it to the AcceptedBloodRequest collection
    if (medicalCard) {
      try {
        await AcceptedBloodRequest.findOneAndUpdate(
          { requestId },
          {
            requestId: request.requestId,
            bloodRequestId: request._id,
            userId: userId,
            hospitalName: request.hospitalName,
            acceptedAt: request.acceptedAt || new Date(),
            status: request.hospitalApproved || 'pending',
            medicalCardInfo: medicalCard
          },
          { upsert: true, new: true }
        );
        console.log('Updated AcceptedBloodRequest with legacy medical card info');
      } catch (err) {
        console.error('Error saving to AcceptedBloodRequest:', err);
      }
    }

    res.json(medicalCard);
  } catch (error) {
    console.error("Error fetching user medical card:", error);
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
  getAcceptedBloodRequests,
  getPendingUserAcceptances,
  approveRejectUserAcceptance,
  getUserMedicalCard
};