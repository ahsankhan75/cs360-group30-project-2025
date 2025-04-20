const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

const hospitalAdminSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  phoneNumber: {
    type: String
  },
  position: {
    type: String
  },
  // Replace the approved boolean with a status field that can have multiple values
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  permissions: {
    manageHospitalInfo: { type: Boolean, default: true },
    manageBloodRequests: { type: Boolean, default: true },
    viewHospitalStats: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Static signup method
hospitalAdminSchema.statics.signup = async function(email, password, fullName, hospitalId, phoneNumber = '', position = '') {
  // Validation
  if (!email || !password || !fullName || !hospitalId) {
    throw Error('All required fields must be filled');
  }
  
  if (!validator.isEmail(email)) {
    throw Error('Email is not valid');
  }
  
  if (!validator.isStrongPassword(password)) {
    throw Error('Password not strong enough');
  }
  
  // Check if hospital admin already exists with this email
  const exists = await this.findOne({ email });
  if (exists) {
    throw Error('Email already in use');
  }
  
  // Check if the hospitalId exists
  const Hospital = mongoose.model('Hospital');
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    throw Error('Hospital not found');
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  // Create hospital admin
  const hospitalAdmin = await this.create({
    email,
    password: hash,
    fullName,
    hospitalId,
    phoneNumber,
    position
  });
  
  return hospitalAdmin;
};

// Static login method
hospitalAdminSchema.statics.login = async function(email, password) {
  // Validation
  if (!email || !password) {
    throw Error('All fields must be filled');
  }
  
  // Find hospital admin
  const hospitalAdmin = await this.findOne({ email });
  if (!hospitalAdmin) {
    throw Error('Incorrect email');
  }
  
  // Check if the hospital admin is approved
  if (hospitalAdmin.status !== 'approved') {
    throw Error('Your account is pending approval. Please contact the administrator.');
  }
  
  // Check password
  const match = await bcrypt.compare(password, hospitalAdmin.password);
  if (!match) {
    throw Error('Incorrect password');
  }
  
  return hospitalAdmin;
};

module.exports = mongoose.model('HospitalAdmin', hospitalAdminSchema);