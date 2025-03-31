const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const hospitalSchema = new Schema({
    name: { type: String, required: true },
    
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String, required: true }
    },

    resources: {
        icu_beds: { type: Number, default: 0 },
        ventilators: { type: Number, default: 0 },
        blood_bank: { type: Boolean, default: false },
        medical_imaging: { type: [String], default: [] }  // Example: ["MRI", "CT Scan"]
    },

    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: false }
    },

    insurance_accepted: { type: [String], default: [] },  // Example: ["ABC Insurance", "XYZ Health"]

    ratings: { type: Number, min: 0, max: 5, default: 0 },

    wait_times: {
        emergency: { type: String, default: "Unknown" },  // Example: "30 mins"
        general: { type: String, default: "Unknown" }
    },

    last_updated: { type: Date, default: Date.now }
});



module.exports = mongoose.model("Hospital", hospitalSchema);