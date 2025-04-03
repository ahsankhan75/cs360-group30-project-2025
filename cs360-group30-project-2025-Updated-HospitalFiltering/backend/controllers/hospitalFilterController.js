// const Hospital = require('../models/hospitalModel')


// const findHospitalByFilter = async (req, res) => {
//     const { icu, ventilator, blood_bank, medicalImaging } = req.query;
    
//     let query = {};
//     if (icu) query["resources.icu_beds"] = { $gte: parseInt(icu) };
//     if (ventilator) query["resources.ventilators"] = { $gte: parseInt(ventilator) };
//     // if (blood_bank !== undefined) query["resources.blood_bank"] = blood_bank === "true";
//     if (blood_bank !== undefined && blood_bank === "true") {
//         query["resources.blood_bank"] = true; // Only hospitals with blood_bank=true
//       }
//     // if (medicalImaging) query["resources.medical_imaging"] = { $all: medicalImaging.split(",") };
//     if (medicalImaging) {
//         const requestedImaging = medicalImaging.split(",").map(item => 
//             item.trim().toLowerCase().replace(/\s+/g, '-')
//         );
        
//         query["resources.medical_imaging"] = {
//             $all: requestedImaging.map(item => 
//                 new RegExp(item.replace(/[- ]/g, '[- ]'), 'i')
//             )
//         };
//     }

//     try {
//         const hospitals = await Hospital.find(query);
//         // console.log(hospitals)
//         res.status(200).json(hospitals);
//     } catch (error) {
//         res.status(400).json({ error: "Error fetching hospitals" });
//     }
// };

// module.exports = { findHospitalByFilter }

const Hospital = require('../models/hospitalModel')


const findHospitalByFilter = async (req, res) => {
    try {
        // const { icu, ventilator, blood_bank, medicalImaging } = req.query;
        const { icu, ventilator, blood_bank, medicalImaging, latitude, longitude, radius } = req.query;
        
        let query = {};
        if (icu) query["resources.icu_beds"] = { $gte: parseInt(icu) };
        if (ventilator) query["resources.ventilators"] = { $gte: parseInt(ventilator) };
        // if (blood_bank !== undefined) query["resources.blood_bank"] = blood_bank === "true";
        if (blood_bank !== undefined && blood_bank === "true") {
            query["resources.blood_bank"] = true; // Only hospitals with blood_bank=true
        }
        // if (medicalImaging) query["resources.medical_imaging"] = { $all: medicalImaging.split(",") };
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

        const hospitals = await Hospital.find(query);
        // console.log(hospitals)
        res.status(200).json(hospitals);
    } catch (error) {
        res.status(400).json({ error: "Error fetching hospitals" });
    }
};

module.exports = { findHospitalByFilter }
