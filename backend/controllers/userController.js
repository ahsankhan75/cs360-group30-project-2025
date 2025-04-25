const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const validator = require("validator");

const getFrontendUrl = () => {
  // Default to localhost if FRONTEND_URL is not set in the environment
  return process.env.FRONTEND_URL || "http://localhost:3000";
};

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// New function to create a token with customizable expiration
const createTokenWithExpiry = (_id, expiresIn = "7d") => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn });
};

// login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    if (!user.emailVerified) {
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in." });
    }
    const token = createToken(user._id);
    // Create a refresh token with longer expiry
    const refreshToken = createTokenWithExpiry(user._id, "30d");

    res.status(200).json({
      email,
      token,
      refreshToken,
      fullName: user.fullName,
      isAdmin: user.isAdmin || false,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup a user
const signupUser = async (req, res) => {
  // console.log("HERE")
  const { email, password, fullName, confirmPassword } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    // 1a) If they _haven’t_ verified, just resend the link
    if (!user.emailVerified) {
      // WHAT IF PASSWORD IS DIFFERENT IN NEW SIGNUP??
      // generate & store a fresh token
      const vToken = crypto.randomBytes(32).toString("hex");
      const vHashed = crypto.createHash("sha256").update(vToken).digest("hex");
      user.emailVerificationToken = vHashed;
      user.emailVerificationExpires = Date.now() + 24 * 3600 * 1000;
      await user.save();

      // send email
      const verifyURL = `${frontendUrl}/verify-email/${vToken}`;
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        to: user.email,
        subject: "Your new verification link",
        html: `<p>Click <a href="${verifyURL}">here</a> to verify your EMCON account.</p>`,
      });

      return res
        .status(200)
        .json({
          message: "Verification link resent. Please check your email.",
        });
    }

    // 1b) Otherwise, they’re fully signed up
    return res.status(400).json({ error: "Email already in use" });
  }

  try {
    const user = await User.signup(email, password, fullName, confirmPassword);
    // const token = createToken(user._id);
    // res.status(200).json({ email, token });
    const vToken = crypto.randomBytes(32).toString("hex");
    const vHashed = crypto.createHash("sha256").update(vToken).digest("hex");

    // 3) Store the hashed token & expiry on the user
    user.emailVerificationToken = vHashed;
    user.emailVerificationExpires = Date.now() + 24 * 3600 * 1000; // 24h
    await user.save();

    // 4) Send the verification email
    const verifyURL = `${frontendUrl}/verify-email/${vToken}`;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Verify your EMCON account",
      html: `
        <h3>Welcome to EMCON!</h3>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyURL}">Verify your email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    // 5) Tell the client to check their inbox
    res
      .status(201)
      .json({
        message: "Signup successful! Check your email to verify your account.",
      });
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
  const { email, password, fullName, adminSecret, confirmPassword } = req.body;

  let existing = await User.findOne({ email });
  if (existing) {
    if (!existing.emailVerified) {
      // resend a fresh verification link
      const vToken = crypto.randomBytes(32).toString("hex");
      const vHashed = crypto.createHash("sha256").update(vToken).digest("hex");
      existing.emailVerificationToken = vHashed;
      existing.emailVerificationExpires = Date.now() + 24 * 3600 * 1000;
      existing.isAdmin = true; // make sure it’s flagged admin
      await existing.save();

      const verifyURL = `${frontendUrl}/admin/verify-email/${vToken}`;
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        to: existing.email,
        subject: "Your new Admin verification link",
        html: `<p>Click <a href="${verifyURL}">here</a> to verify your EMCON Admin account.</p>`,
      });

      return res
        .status(200)
        .json({
          message: "Verification link resent. Please check your email.",
        });
    }

    // fully signed up & verified already
    return res.status(400).json({ error: "Email already in use" });
  }

  try {
    if (adminSecret !== process.env.ADMIN_SECRET) {
      throw Error("Invalid admin secret code");
    }

    const user = await User.signup(email, password, fullName, confirmPassword);

    user.isAdmin = true;

    // 4) generate & store vToken
    const vToken = crypto.randomBytes(32).toString("hex");
    const vHashed = crypto.createHash("sha256").update(vToken).digest("hex");
    user.emailVerificationToken = vHashed;
    user.emailVerificationExpires = Date.now() + 24 * 3600 * 1000;
    await user.save();

    // 5) send the email
    const verifyURL = `${frontendUrl}/admin/verify-email/${vToken}`;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      to: user.email,
      subject: "Verify your EMCON Admin account",
      html: `
        <h3>Welcome, ${user.fullName}!</h3>
        <p>Please verify your email by clicking below:</p>
        <a href="${verifyURL}">Verify Admin account</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    // 6) respond to client
    return res
      .status(201)
      .json({
        message:
          "Admin signup successful! Check your email to verify your account.",
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
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET || process.env.SECRET
      );
    } catch (error) {
      return res.status(401).json({
        error: "Invalid or expired refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Find the user
    const user = await User.findById(decoded._id).select(
      "_id email fullName isAdmin"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create new tokens
    const token = createToken(user._id);
    const newRefreshToken = createTokenWithExpiry(user._id, "30d");

    res.status(200).json({
      email: user.email,
      token,
      refreshToken: newRefreshToken,
      fullName: user.fullName,
      isAdmin: user.isAdmin || false,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "No user with that email" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.passwordResetToken = hashed;
  user.passwordResetExpires = Date.now() + 3600 * 1000;
  await user.save();

  // let resetURL = `http://localhost:3000/reset-password/${resetToken}`;
  // if (user.isAdmin) {
  //   resetURL = `http://localhost:3000/admin/reset-password/${resetToken}`;
  // }// else {
  //   const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
  // }
  const resetURL = `${frontendUrl}/reset-password/${resetToken}`;
  const transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST,
    // port: Number(process.env.SMTP_PORT),
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    to: user.email,
    subject: "Your password reset link (valid 1 hour)",
    html: `<p>Please click <a href="${resetURL}">here</a> to reset your password.</p>`,
  });

  res.status(200).json({ message: "Token sent to email" });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({
      error:
        "Password not strong enough. " +
        "It must be at least 8 characters long and include lowercase, uppercase, numbers and symbols.",
    });
  }

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ error: "Token invalid or expired" });

  user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password has been reset." });
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  // 1) Hash & find the user
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user)
    return res
      .status(400)
      .json({ error: "Verification link invalid or expired." });

  // 2) Mark email verified
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  // 3) Issue JWT + refresh token
  const authToken = createToken(user._id);

  // 4) Return the same shape your login/signup handlers return
  res.status(200).json({
    email: user.email,
    token: authToken,
  });
};

const adminForgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "No user with that email" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.passwordResetToken = hashed;
  user.passwordResetExpires = Date.now() + 3600 * 1000;
  await user.save();

  const resetURL = `${frontendUrl}/admin/reset-password/${resetToken}`;
  // if (user.isAdmin) {
  //   resetURL = `http://localhost:3000/admin/reset-password/${resetToken}`;
  // }// else {
  //   const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
  // }
  // const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
  const transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST,
    // port: Number(process.env.SMTP_PORT),
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    to: user.email,
    subject: "Your password reset link (valid 1 hour)",
    html: `<p>Please click <a href="${resetURL}">here</a> to reset your password.</p>`,
  });

  res.status(200).json({ message: "Token sent to email" });
};

module.exports = {
  signupUser,
  loginUser,
  loginAdmin,
  signupAdmin,
  refreshToken,
  createToken: createTokenWithExpiry,
  forgotPassword,
  resetPassword,
  adminForgotPassword,
  verifyEmail,
};
