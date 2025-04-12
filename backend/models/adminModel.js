const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const Schema = mongoose.Schema

const adminSchema = new Schema({
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
  role: {
    type: String,
    default: 'admin'
  },
  permissions: {
    manageUsers: {
      type: Boolean,
      default: true
    },
    manageHospitals: {
      type: Boolean,
      default: true
    },
    manageReviews: {
      type: Boolean,
      default: true
    },
    manageBloodRequests: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true })

// Static signup method
adminSchema.statics.signup = async function(email, password, fullName) {
  // Validation
  if (!email || !password || !fullName) {
    throw Error('All fields must be filled')
  }
  if (!validator.isEmail(email)) {
    throw Error('Email is not valid')
  }
  if (!validator.isStrongPassword(password)) {
    throw Error('Password not strong enough')
  }

  const exists = await this.findOne({ email })

  if (exists) {
    throw Error('Email already in use')
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const admin = await this.create({ email, password: hash, fullName })

  return admin
}

// Static login method
adminSchema.statics.login = async function(email, password) {
  if (!email || !password) {
    throw Error('All fields must be filled')
  }

  const admin = await this.findOne({ email })
  if (!admin) {
    throw Error('Incorrect email')
  }

  const match = await bcrypt.compare(password, admin.password)
  if (!match) {
    throw Error('Incorrect password')
  }

  return admin
}

module.exports = mongoose.model('Admin', adminSchema)
