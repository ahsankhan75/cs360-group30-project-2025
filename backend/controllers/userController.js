const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const validator = require('validator');

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// New function to create a token with customizable expiration
const createTokenWithExpiry = (_id, expiresIn = '7d') => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn });
};

// login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    // Create a refresh token with longer expiry
    const refreshToken = createTokenWithExpiry(user._id, '30d');
    
    res.status(200).json({ 
      email, 
      token, 
      refreshToken,
      fullName: user.fullName,
      isAdmin: user.isAdmin || false
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup a user
const signupUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.signup(email, password);
    const token = createToken(user._id);
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    if (!user.isAdmin) {
      throw Error("Not authorized as admin");
    }

    const token = createToken(user._id);

    res.status(200).json({
      email,
      token,
      fullName: user.fullName || "Admin User",
      isAdmin: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin signup
const signupAdmin = async (req, res) => {
  const { email, password, fullName, adminSecret } = req.body;

  try {
    if (adminSecret !== process.env.ADMIN_SECRET) {
      throw Error("Invalid admin secret code");
    }

    const user = await User.signup(email, password, fullName);

    user.isAdmin = true;
    await user.save();

    const token = createToken(user._id);

    res.status(200).json({
      email,
      token,
      fullName: user.fullName,
      isAdmin: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Refresh token endpoint
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // If no refresh token is provided
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }
    
    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || process.env.SECRET);
    } catch (error) {
      return res.status(401).json({ 
        error: "Invalid or expired refresh token",
        code: "INVALID_REFRESH_TOKEN"
      });
    }
    
    // Find the user
    const user = await User.findById(decoded._id).select('_id email fullName isAdmin');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Create new tokens
    const token = createToken(user._id);
    const newRefreshToken = createTokenWithExpiry(user._id, '30d');
    
    res.status(200).json({
      email: user.email,
      token,
      refreshToken: newRefreshToken,
      fullName: user.fullName,
      isAdmin: user.isAdmin || false
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'No user with that email' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashed;
  user.passwordResetExpires = Date.now() + 3600 * 1000;
  await user.save();

  const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
  const transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST,
    // port: Number(process.env.SMTP_PORT),
    host: 'smtp.gmail.com', 
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  await transporter.sendMail({
    to: user.email,
    subject: 'Your password reset link (valid 1 hour)',
    html: `<p>Please click <a href="${resetURL}">here</a> to reset your password.</p>`
  });

  res.status(200).json({ message: 'Token sent to email' });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({
      error:
        'Password not strong enough. ' +
        'It must be at least 8 characters long and include lowercase, uppercase, numbers and symbols.'
    });
  }

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) return res.status(400).json({ error: 'Token invalid or expired' });

  user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({ message: 'Password has been reset.' });
};

module.exports = { 
  signupUser, 
  loginUser, 
  loginAdmin, 
  signupAdmin,
  refreshToken,
  createToken: createTokenWithExpiry,
  forgotPassword,
  resetPassword
};
