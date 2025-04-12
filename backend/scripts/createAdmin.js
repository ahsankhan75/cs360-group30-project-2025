require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/userModel')
const bcrypt = require('bcrypt')

// Admin user details
const adminEmail = 'admin@example.com'
const adminPassword = 'StrongPassword123!'
const adminFullName = 'System Administrator'

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    createAdmin()
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  })

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail })
    
    if (existingAdmin) {
      console.log('Admin account already exists')
      
      // Ensure it has admin privileges
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true
        existingAdmin.adminPermissions = {
          manageUsers: true,
          manageHospitals: true,
          manageReviews: true,
          manageBloodRequests: true
        }
        await existingAdmin.save()
        console.log('Updated existing account with admin privileges')
      }
    } else {
      // Create new admin account
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(adminPassword, salt)
      
      const admin = await User.create({
        email: adminEmail,
        password: hash,
        fullName: adminFullName,
        isAdmin: true,
        adminPermissions: {
          manageUsers: true,
          manageHospitals: true,
          manageReviews: true,
          manageBloodRequests: true
        }
      })
      
      console.log('Admin account created successfully')
      console.log(`Email: ${adminEmail}`)
      console.log(`Password: ${adminPassword}`)
    }
    
    mongoose.connection.close()
  } catch (error) {
    console.error('Error creating admin account:', error)
    mongoose.connection.close()
    process.exit(1)
  }
}
