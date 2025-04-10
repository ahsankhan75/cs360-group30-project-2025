const Hospital = require('../models/hospitalModel');
const Review = require('../models/reviewModel');

const findHospitalByFilter = async (req, res) => {
    try {
        const { icu, ventilator, blood_bank, medicalImaging, latitude, longitude, radius, name, location, services, minRating } = req.query;
        
        let query = {};
        if (icu) query["resources.icu_beds"] = { $gte: parseInt(icu) };
        if (ventilator) query["resources.ventilators"] = { $gte: parseInt(ventilator) };
        
        if (blood_bank !== undefined && blood_bank === "true") {
            query["resources.blood_bank"] = true; 
        }
        if (medicalImaging) {
            const requestedImaging = medicalImaging.split(",").map(item => 
                item.trim().toLowerCase().replace(/\s+/g, '-')
            );
            
            query["resources.medical_imaging"] = {
                $all: requestedImaging.map(item => 
                    new RegExp(item.replace(/[- ]/g, '[- ]'), 'i')
                )
            };
        }

        // ✅ Geospatial Filtering (Find hospitals within 'radius' km)
        if (latitude && longitude && radius) {
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)],
                    },
                    $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
                },
            };
        }

        // Apply additional filters based on query parameters
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        
        if (location) {
            query['location.address'] = { $regex: location, $options: 'i' };
        }
        
        if (services) {
            const servicesList = services.split(',').map(s => s.trim());
            query.services = { $in: servicesList };
        }
        
        if (minRating) {
            query.ratings = { $gte: parseFloat(minRating) };
        }

        const hospitals = await Hospital.find(query)
            .sort({ ratings: -1, name: 1 }); // Sort by rating (desc) and then name

        // Get review counts for these hospitals
        const hospitalIds = hospitals.map(h => h._id);
        const reviewCounts = await Review.aggregate([
            { $match: { hospitalId: { $in: hospitalIds } } },
            { $group: { _id: '$hospitalId', count: { $sum: 1 } } }
        ]);
        
        // Create a map of hospital ID to review count
        const reviewCountMap = {};
        reviewCounts.forEach(item => {
            reviewCountMap[item._id] = item.count;
        });
        
        // Add review count to each hospital
        const hospitalsWithReviewCount = hospitals.map(hospital => {
            const hospitalObj = hospital.toObject();
            hospitalObj.reviewCount = reviewCountMap[hospital._id] || 0;
            return hospitalObj;
        });

        res.status(200).json(hospitalsWithReviewCount);
    } catch (error) {
        res.status(400).json({ error: "Error fetching hospitals" });
    }
};

module.exports = { findHospitalByFilter };
