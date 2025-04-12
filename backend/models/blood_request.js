const mongoose = require('mongoose');

// Update schema to ensure consistent location data and add acceptance tracking
const BloodRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  hospitalName: { type: String, required: true },
  bloodType: { type: String, required: true },
  urgencyLevel: { type: String, required: true },
  location: { type: String, required: true },
  datePosted: { type: Date, required: true },
  unitsNeeded: { type: Number, required: true },
  accepted: { type: Boolean, default: false },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Add this to track who accepted
  acceptedAt: { type: Date }, // Add this to track when it was accepted
  // Ensure latitude and longitude are explicitly defined in the schema
  latitude: { type: Number },
  longitude: { type: Number },
  contactNumber: { type: String },
  email: { type: String }
}, { collection: "blood_req" });

// Add index for geospatial queries to improve performance
BloodRequestSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);


