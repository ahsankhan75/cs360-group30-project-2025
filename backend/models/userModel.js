const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
    fullName: {
    type: String,
    required: true,
    trim: true
    },
    email: {
    type: String,
    required: true,
    unique: true
    },
    password: {
    type: String,
    required: true
    }
})

// static signup method
userSchema.statics.signup = async function(fullName, email, password, confirmPassword) {
    // if (!email || !password) {
    //     throw Error('All fields must be filled')
    // }
    // console.log(fullName, email, password, confirmPassword)
    if (!fullName || !email || !password || !confirmPassword) {
        throw Error('All fields must be filled');
    }
    if (!validator.isEmail(email)) {
        throw Error('Email is not valid')
    }
    if (!validator.isStrongPassword(password)) {
        throw Error('Password not strong enough')
    }
    if (password !== confirmPassword) {
        throw Error('Passwords do not match');
    }

    const exists = await this.findOne({ email })
    if (exists) {
        throw Error('Email already in use')
    }
    // console.log(fullName, email, password, confirmPassword)
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({ fullName, email, password: hash })

    return user
}

userSchema.statics.login = async function(email, password) {
    if (!email || !password) {
        throw Error('All fields must be filled')
    }

    const user = await this.findOne({ email })
    if (!user) {
        throw Error('Incorrect email')
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
        throw Error('Incorrect password')
    }

    return user
}


/**
 * New static method for admin signup.
 * This function:
 *  - Checks that all fields, including adminId, are provided.
 *  - Validates the email and password.
 *  - Checks if the provided adminId exists in the "admin-ids" collection.
 *  - Checks that this adminId is not already used in the "admins" collection.
 *  - Hashes the password and creates a new admin document in the "admins" collection.
 */


userSchema.statics.signupAsAdmin = async function(
    fullName,
    email,
    password,
    confirmPassword,
    adminId
  ) {
    if (!fullName || !email || !password || !confirmPassword || !adminId) {
      throw Error('All fields including adminId must be filled');
    }
    if (!validator.isEmail(email)) {
      throw Error('Email is not valid');
    }
    if (!validator.isStrongPassword(password)) {
      throw Error('Password not strong enough');
    }
    if (password !== confirmPassword) {
      throw Error('Passwords do not match');
    }
  
    let adminObjectId;
    try {
      adminObjectId = new ObjectId(adminId);
    } catch (error) {
      throw Error('Invalid admin ID format');
    }
  
    // Debug: log the converted ObjectId
    console.log('Converted adminObjectId:', adminObjectId);
  
    // Get the admin-ids collection (ensure the collection name matches exactly)
    const adminIdsCollection = mongoose.connection.collection('admin-ids');
  
    // First, try to find the record using _id as ObjectId
    let validAdminRecord = await adminIdsCollection.findOne({ _id: adminObjectId });
    if (!validAdminRecord) {
      // Fallback: try to find a record where _id is stored as a string.
      validAdminRecord = await adminIdsCollection.findOne({ _id: adminId });
    }
  
    // Debug: log what we found
    // console.log('Found validAdminRecord:', validAdminRecord);
  
    if (!validAdminRecord) {
      throw Error('This hospital is not in our records');
    }
  
    // Check that the adminId is not already used in the "admins" collection
    const adminsCollection = mongoose.connection.collection('admins');
    let existingAdmin = await adminsCollection.findOne({ adminId: adminObjectId });
    if (!existingAdmin) {
      // Fallback: try as string
      existingAdmin = await adminsCollection.findOne({ adminId: adminId });
    }
    if (existingAdmin) {
      throw Error('Admin already exists');
    }
  
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    // Insert new admin document into the "admins" collection
    const result = await adminsCollection.insertOne({
      adminId: adminObjectId, // storing as ObjectId (or change to adminId if you prefer string)
      fullName,
      email,
      password: hashedPassword
    });
  
    return result;
  }
  // Add this below your existing static methods
  userSchema.statics.adminLogin = async function(email, password) {
    if (!email || !password) {
      throw Error('All fields must be filled');
    }
    // Directly query the "admins" collection
    const adminsCollection = mongoose.connection.collection('admins');
    const admin = await adminsCollection.findOne({ email: email });
    if (!admin) {
      throw Error('Incorrect email');
    }
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      throw Error('Incorrect password');
    }
    return admin;
  }
  

module.exports = mongoose.model('User', userSchema)