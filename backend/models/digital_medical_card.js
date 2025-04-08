const mongoose = require("mongoose");

const DigitalMedicalCardSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    name: { type: String },
    dateOfBirth: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    userContactNumber: { type: String },

    bloodType: { type: String },
    organDonor: { type: Boolean },
    allergies: { type: String },
    currentMedications: { type: String },
    medicalDevicesImplants: { type: String },
    recentSurgeryHospitalization: { type: String },
    dietaryRestrictions: { type: String },

    primaryEmergencyContact: {
      name: { type: String },
      relationship: { type: String },
      number: { type: String },
    },

    secondaryEmergencyContact: {
      name: { type: String },
      relationship: { type: String },
      number: { type: String },
    },

    insurance: {
      provider: { type: String },
      policyNumber: { type: String },
      groupNumber: { type: String },
    },

    primaryPhysician: {
      name: { type: String },
      specialization: { type: String },
      contact: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DigitalMedicalCard", DigitalMedicalCardSchema);
