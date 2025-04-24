const mongoose = require('mongoose');

// Pre-save middleware to generate requestId if not provided
const generateRequestId = function(next) {
  if (!this.requestId) {
    this.requestId = new mongoose.Types.ObjectId().toString();
  }
  next();
};

// Update schema to ensure consistent location data and add acceptance tracking
const BloodRequestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  hospitalName: { type: String, required: true },
  bloodType: { type: String, required: true },
  urgencyLevel: { type: String, required: true, enum: ['Normal', 'Urgent', 'Critical'] },
  location: { type: String, required: true },
  datePosted: { type: Date, required: true },
  expiryDate: { type: Date, default: function() {
    // Default expiry date is 7 days from posting
    const date = new Date(this.datePosted);
    date.setDate(date.getDate() + 7);
    return date;
  }},
  unitsNeeded: { type: Number, required: true, min: 1 },
  // User acceptance status
  userAccepted: { type: Boolean, default: false },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acceptedAt: { type: Date },
  acceptedByName: { type: String }, // Store user name for quick access

  // Hospital admin approval status
  hospitalApproved: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  hospitalApprovedAt: { type: Date },
  hospitalRejectionReason: { type: String },

  // For backward compatibility
  accepted: { type: Boolean, default: false },
  latitude: { type: Number },
  longitude: { type: Number },
  contactNumber: { type: String },
  email: { type: String }
}, { collection: "bloodrequests", timestamps: true });

// Add index for geospatial queries to improve performance
BloodRequestSchema.index({ latitude: 1, longitude: 1 });

// Add pre-save middleware
BloodRequestSchema.pre('save', generateRequestId);

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);


