const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bloodRequestSchema = new Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  unitsNeeded: {
    type: Number,
    required: true,
    min: 1
  },
  urgencyLevel: {
    type: String,
    required: true,
    enum: ['Normal', 'Urgent', 'Critical']
  },
  location: {
    type: String,
    required: true
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  accepted: {
    type: Boolean,
    default: false
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contactInfo: {
    name: String,
    phone: String,
    email: String
  },
  hospitalRating: {
    type: Number,
    min: 0,
    max: 5
  }
}, { timestamps: true });

// Create index for efficient queries
bloodRequestSchema.index({ bloodType: 1, urgencyLevel: 1 });
bloodRequestSchema.index({ hospitalId: 1 });
bloodRequestSchema.index({ datePosted: -1 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
