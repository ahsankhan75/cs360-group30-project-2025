const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const hospitalSchema = new Schema({
    name: { type: String, required: true },

    location: {
        type: { type: String, enum: ["Point"], default: "Point" },  // GeoJSON type
        coordinates: { type: [Number], required: true },  // [longitude, latitude]
        address: { type: String, required: true }
    },

    // Add the new cityu field
    cityu: { type: String, required: false, trim: true },

    resources: {
        icu_beds: { type: Number, default: 0 },
        ventilators: { type: Number, default: 0 },
        blood_bank: { type: Boolean, default: false },
        emergency_capacity: { type: Number, default: 0 },
        medical_imaging: { type: [String], default: [] }  // Example: ["MRI", "CT", "X-Ray", "Ultrasound"]
    },

    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: false },
        website: { type: String, required: false }
    },

    insurance_accepted: { type: [String], default: [] },  // Example: ["ABC Insurance", "XYZ Health"]

    // Services offered by the hospital - to better categorize medical specialties
    services: { type: [String], default: [] }, // Example: ["Emergency Care", "Cardiology", "Orthopedic"]

    ratings: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },

    wait_times: {
        emergency: { type: String, default: "Unknown" },  // Example: "30 mins"
        general: { type: String, default: "Unknown" }
    },

    last_updated: { type: Date, default: Date.now }
});

// Create a geospatial index for efficient location-based queries
hospitalSchema.index({ location: "2dsphere" });

// Create a text index for name and address to improve search functionality
hospitalSchema.index({ name: 'text', 'location.address': 'text' });

module.exports = mongoose.model("Hospital", hospitalSchema);