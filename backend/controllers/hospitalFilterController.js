const Hospital = require('../models/hospitalModel');
const Review = require('../models/reviewModel');

/**
 * Filter hospitals based on search criteria
 */
const findHospitalByFilter = async (req, res) => {
  try {
    const {
      name,
      minRating,
      blood_bank,
      medicalImaging,
      latitude,
      longitude,
      radius,
      icu,
      services
    } = req.query;

    // Build query object
    let query = {};

    // Name filter (case-insensitive partial match)
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    // Minimum rating filter
    if (minRating) {
      query.ratings = { $gte: parseFloat(minRating) };
    }

    // Blood bank filter
    if (blood_bank === 'true') {
      query["resources.blood_bank"] = true;
    }

    // Medical imaging filter
    if (medicalImaging) {
      const imagingOptions = medicalImaging.split(',');
      query["resources.medical_imaging"] = { $all: imagingOptions };
    }

    // ICU beds minimum count
    if (icu) {
      query["resources.icu_beds"] = { $gte: parseInt(icu) };
    }

    // Services filter
    if (services) {
      query.services = { $in: services.split(',') };
    }

    // Geospatial query if coordinates and radius are provided
    if (latitude && longitude && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      };
    }

    // Execute query
    const hospitals = await Hospital.find(query)
      .sort({ ratings: -1, name: 1 })
      .lean();
    
    // Enhance the results with reviewCount
    const enhancedHospitals = hospitals.map(hospital => ({
      ...hospital,
      reviewCount: hospital.reviewCount || Math.floor(Math.random() * 50) // For demo purposes
    }));

    res.status(200).json(enhancedHospitals);
  } catch (error) {
    console.error("Hospital filter error:", error);
    res.status(400).json({ error: "Failed to filter hospitals" });
  }
};

module.exports = {
  findHospitalByFilter
};
