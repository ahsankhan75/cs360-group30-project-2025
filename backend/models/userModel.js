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

module.exports = mongoose.model('User', userSchema)