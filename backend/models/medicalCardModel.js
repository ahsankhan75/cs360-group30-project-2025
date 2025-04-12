const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const emergencyContactSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  relationship: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  }
});

const insuranceSchema = new Schema({
  provider: {
    type: String,
    required: false
  },
  policyNumber: {
    type: String,
    required: false
  },
  groupNumber: {
    type: String,
    required: false
  }
});

const physicianSchema = new Schema({
  name: {
    type: String,
    required: false
  },
  specialization: {
    type: String,
    required: false
  },
  contact: {
    type: String,
    required: false
  }
});

const medicalCardSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  userContactNumber: {
    type: String,
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  organDonor: {
    type: Boolean,
    default: false
  },
  allergies: {
    type: String,
    default: ''
  },
  currentMedications: {
    type: String,
    default: ''
  },
  medicalDevicesImplants: {
    type: String,
    default: ''
  },
  recentSurgeryHospitalization: {
    type: String,
    default: ''
  },
  dietaryRestrictions: {
    type: String,
    default: ''
  },
  primaryEmergencyContact: {
    type: emergencyContactSchema,
    required: true
  },
  secondaryEmergencyContact: {
    type: emergencyContactSchema,
    required: false
  },
  insurance: {
    type: insuranceSchema,
    required: false
  },
  primaryPhysician: {
    type: physicianSchema,
    required: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MedicalCard', medicalCardSchema);
