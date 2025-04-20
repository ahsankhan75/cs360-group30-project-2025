const mongoose = require('mongoose');

const acceptedBloodRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true
  },
  bloodRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  acceptedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  // Store the medical card information directly
  medicalCardInfo: {
    name: String,
    email: String,
    dateOfBirth: Date,
    age: String,
    gender: String,
    userContactNumber: String,
    bloodType: String,
    organDonor: Boolean,
    allergies: String,
    currentMedications: String,
    medicalDevicesImplants: String,
    recentSurgeryHospitalization: String,
    dietaryRestrictions: String,
    primaryEmergencyContact: {
      name: String,
      relationship: String,
      number: String
    },
    secondaryEmergencyContact: {
      name: String,
      relationship: String,
      number: String
    },
    insurance: {
      provider: String,
      policyNumber: String,
      groupNumber: String
    },
    primaryPhysician: {
      name: String,
      specialization: String,
      contact: String
    },
    lastUpdated: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('AcceptedBloodRequest', acceptedBloodRequestSchema);
