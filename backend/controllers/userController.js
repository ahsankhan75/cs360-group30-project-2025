require("dotenv").config(); // Ensure dotenv is configured if running locally standalone
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const validator = require("validator");

// --- Helper function to get frontend URL ---
// Provides a default fallback, though ideally FRONTEND_URL should always be set.
const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || "http://localhost:3000"; // Fallback if not set
};

// --- (createToken, createTokenWithExpiry, loginUser - no changes needed here) ---
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

const createTokenWithExpiry = (_id, expiresIn = "7d") => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn });
};

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
    const refreshToken = createTokenWithExpiry(user._id, "30d"); // Example: 30-day refresh token

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
  const { email, password, fullName, confirmPassword } = req.body;
  const frontendUrl = getFrontendUrl(); // Get the base URL

  try {
    let user = await User.findOne({ email });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    if (user) {
      if (!user.emailVerified) {
        // Resend verification logic (consider password update if needed)
        const vToken = crypto.randomBytes(32).toString("hex");
        const vHashed = crypto
          .createHash("sha256")
          .update(vToken)
          .digest("hex");
        user.emailVerificationToken = vHashed;
        user.emailVerificationExpires = Date.now() + 24 * 3600 * 1000; // 24h
        // Consider if the password needs updating if they retry signup with a different one
        // user.password = await User.hashPassword(password); // Example if needed
        await user.save();

        // Use dynamic frontend URL
        const verifyURL = `${frontendUrl}/verify-email/${vToken}`; // <-- CHANGE HERE

        await transporter.sendMail({
          to: user.email,
          subject: "Your new verification link",
          html: `<p>Click <a href="${verifyURL}">here</a> to verify your EMCON account.</p>`,
        });

        return res.status(200).json({
          message: "Verification link resent. Please check your email.",
        });
      }
      // Already verified and exists
      return res.status(400).json({ error: "Email already in use" });
    }

    // New user signup
    user = await User.signup(email, password, fullName, confirmPassword);

    const vToken = crypto.randomBytes(32).toString("hex");
    const vHashed = crypto.createHash("sha256").update(vToken).digest("hex");
    user.emailVerificationToken = vHashed;
    user.emailVerificationExpires = Date.now() + 24 * 3600 * 1000; // 24h
    await user.save();

    // Use dynamic frontend URL
    const verifyURL = `${frontendUrl}/verify-email/${vToken}`; // <-- CHANGE HERE

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

    res.status(201).json({
      message: "Signup successful! Check your email to verify your account.",
    });
  } catch (error) {
    // Log the detailed error for debugging on the server
    console.error("Signup Error:", error);
    // Send a generic or specific error message to the client
    if (error.message.includes("duplicate key error")) {
      res.status(400).json({ error: "Email already exists." });
    } else if (error.message.includes("validation failed")) {
      // You might want to parse the validation error for more specific feedback
      res
        .status(400)
        .json({ error: "Signup validation failed. Please check your input." });
    } else {
      res.status(400).json({
        error: error.message || "Signup failed due to an unexpected error.",
      });
    }
  }
};

// --- (loginAdmin - no changes needed here) ---
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    if (!user.isAdmin) {
      throw Error("Not authorized as admin");
    }

    const token = createToken(user._id);
    const refreshToken = createTokenWithExpiry(user._id, "30d"); // Consistent refresh token

    res.status(200).json({
      email,
      token,
      refreshToken, // Send refresh token for admin too
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
  const frontendUrl = getFrontendUrl(); // Get the base URL

  // Basic validation
  if (!email || !password || !fullName || !adminSecret || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Email is not valid" });
  }
  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({ error: "Password not strong enough" });
  }

  try {
    // Check admin secret FIRST before hitting database if possible
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Invalid admin secret code" }); // Use 401 Unauthorized
    }

    let existing = await User.findOne({ email });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    if (existing) {
      if (!existing.emailVerified) {
        // Resend Admin verification
        const vToken = crypto.randomBytes(32).toString("hex");
        const vHashed = crypto
          .createHash("sha256")
          .update(vToken)
          .digest("hex");
        existing.emailVerificationToken = vHashed;
        existing.emailVerificationExpires = Date.now() + 24 * 3600 * 1000;
        existing.isAdmin = true; // Ensure flagged as admin
        // Consider password update if needed
        await existing.save();

        // Use dynamic frontend URL
        const verifyURL = `${frontendUrl}/admin/verify-email/${vToken}`; // <-- CHANGE HERE

        await transporter.sendMail({
          to: existing.email,
          subject: "Your new Admin verification link",
          html: `<p>Click <a href="${verifyURL}">here</a> to verify your EMCON Admin account.</p>`,
        });
        return res.status(200).json({
          message: "Verification link resent. Please check your email.",
        });
      }
      // Already verified admin or regular user exists
      return res.status(400).json({ error: "Email already in use" });
    }

    // Create new admin user
    const user = await User.signup(email, password, fullName, confirmPassword); // Use the existing signup static
    user.isAdmin = true;

    const vToken = crypto.randomBytes(32).toString("hex");
    const vHashed = crypto.createHash("sha256").update(vToken).digest("hex");
    user.emailVerificationToken = vHashed;
    user.emailVerificationExpires = Date.now() + 24 * 3600 * 1000;
    await user.save();

    // Use dynamic frontend URL
    const verifyURL = `${frontendUrl}/admin/verify-email/${vToken}`; // <-- CHANGE HERE

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

    return res.status(201).json({
      message:
        "Admin signup successful! Check your email to verify your account.",
    });
  } catch (error) {
    console.error("Admin Signup Error:", error); // Log detailed error
    // Avoid sending potentially sensitive error details like stack traces
    res.status(400).json({ error: error.message || "Admin signup failed." });
  }
};

// Refresh token endpoint
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    // Use the primary SECRET for refresh token verification unless you specifically set REFRESH_SECRET
    const decoded = jwt.verify(refreshToken, process.env.SECRET);

    const user = await User.findById(decoded._id).select(
      "_id email fullName isAdmin emailVerified" // Ensure emailVerified is selected
    );

    if (!user) {
      return res
        .status(404)
        .json({ error: "User associated with token not found" });
    }

    // Optional: Add check if user is still active or email is verified, if needed
    if (!user.emailVerified) {
      return res
        .status(403)
        .json({ error: "Email not verified", code: "EMAIL_NOT_VERIFIED" });
    }

    // Issue new tokens
    const newAccessToken = createToken(user._id);
    const newRefreshToken = createTokenWithExpiry(user._id, "30d"); // Issue a new refresh token as well

    res.status(200).json({
      email: user.email,
      token: newAccessToken,
      refreshToken: newRefreshToken, // Send the new refresh token back
      fullName: user.fullName,
      isAdmin: user.isAdmin || false,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: "Refresh token expired",
        code: "REFRESH_TOKEN_EXPIRED",
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

// Forgot Password (for regular users)
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const frontendUrl = getFrontendUrl();

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email, isAdmin: { $ne: true } }); // Ensure it's not an admin using this route
    if (!user) {
      // Important: Don't reveal if the user exists or not for security
      console.warn(
        `Password reset attempt for non-existent or admin email: ${email}`
      );
      return res.status(200).json({
        message:
          "If an account with that email exists and is not an admin account, a password reset link has been sent.",
      });
    }

    // Check if email is verified before allowing password reset
    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your email before resetting the password.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashed;
    user.passwordResetExpires = Date.now() + 3600 * 1000; // 1 hour expiry
    await user.save();

    // Use dynamic frontend URL
    const resetURL = `${frontendUrl}/reset-password/${resetToken}`; // <-- CHANGE HERE

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
      subject: "Your password reset link (valid 1 hour)",
      html: `<p>You requested a password reset for your EMCON account.</p>
                 <p>Please click <a href="${resetURL}">here</a> to reset your password.</p>
                 <p>If you did not request this, please ignore this email.</p>
                 <p>This link expires in 1 hour.</p>`,
    });

    res.status(200).json({
      message:
        "If an account with that email exists and is not an admin account, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      error: "An error occurred while processing the password reset request.",
    });
  }
};

// Reset Password (handles token from URL param for both user/admin)
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  // --- Input Validation ---
  if (!password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: "Both password and confirm password are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({
      error:
        "Password not strong enough. " +
        "It must be at least 8 characters long and include lowercase, uppercase, numbers and symbols.",
    });
  }
  // --- End Validation ---

  try {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Password reset link is invalid or has expired." });
    }

    // Hash the new password
    user.password = await bcrypt.hash(password, 10); // Use bcrypt directly or your model static if preferred
    user.passwordResetToken = undefined; // Clear the reset token
    user.passwordResetExpires = undefined; // Clear the expiry
    // Optional: Ensure email is marked as verified if resetting password implies verification
    // user.emailVerified = true;
    await user.save();

    // Optionally log the user in immediately after reset
    // const authToken = createToken(user._id);
    // const refreshToken = createTokenWithExpiry(user._id, "30d");
    // res.status(200).json({
    //     message: "Password has been reset successfully.",
    //     email: user.email,
    //     token: authToken,
    //     refreshToken: refreshToken,
    //     fullName: user.fullName,
    //     isAdmin: user.isAdmin
    // });

    res.status(200).json({
      message: "Password has been reset successfully. Please log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while resetting the password." });
  }
};

// Verify Email (handles token from URL param for both user/admin)
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: "Verification token is missing." });
  }

  try {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Check if the email might already be verified (e.g., user clicked link twice)
      const alreadyVerifiedUser = await User.findOne({
        emailVerificationToken: undefined,
        emailVerified: true,
      }); // This check might need refinement based on your exact logic/schema
      // A more robust check might involve finding the user by email if the token was previously associated with them, but this adds complexity.
      // For simplicity, just informing the link is invalid/expired is usually sufficient.
      return res
        .status(400)
        .json({ error: "Verification link is invalid or has expired." });
    }

    // Prevent re-verification if already done
    if (user.emailVerified) {
      // Optionally log them in or just inform them
      console.log(`Email ${user.email} already verified.`);
      // You could issue tokens here if desired, similar to successful verification
      const authToken = createToken(user._id);
      const refreshToken = createTokenWithExpiry(user._id, "30d");
      return res.status(200).json({
        message: "Email already verified.",
        email: user.email,
        token: authToken,
        refreshToken: refreshToken,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
      });
    }

    // Mark email as verified and clear verification fields
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Log the user in by issuing tokens
    const authToken = createToken(user._id);
    const refreshToken = createTokenWithExpiry(user._id, "30d");

    // Return data consistent with login response
    res.status(200).json({
      message: "Email verified successfully!",
      email: user.email,
      token: authToken,
      refreshToken: refreshToken,
      fullName: user.fullName,
      isAdmin: user.isAdmin || false, // Ensure isAdmin is included
    });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred during email verification." });
  }
};

// Forgot Password (for admins)
const adminForgotPassword = async (req, res) => {
  const { email } = req.body;
  const frontendUrl = getFrontendUrl();

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email, isAdmin: true }); // Ensure it's an admin
    if (!user) {
      console.warn(
        `Admin password reset attempt for non-existent or non-admin email: ${email}`
      );
      // Don't reveal if the user exists or is an admin
      return res.status(200).json({
        message:
          "If an admin account with that email exists, a password reset link has been sent.",
      });
    }

    // Check if admin email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your admin email before resetting the password.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashed;
    user.passwordResetExpires = Date.now() + 3600 * 1000; // 1 hour
    await user.save();

    // Use dynamic frontend URL with admin path
    const resetURL = `${frontendUrl}/admin/reset-password/${resetToken}`; // <-- CHANGE HERE

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
      subject: "Admin Password Reset Link (valid 1 hour)",
      html: `<p>You requested a password reset for your EMCON Admin account.</p>
                 <p>Please click <a href="${resetURL}">here</a> to reset your password.</p>
                 <p>If you did not request this, please ignore this email.</p>
                 <p>This link expires in 1 hour.</p>`,
    });

    res.status(200).json({
      message:
        "If an admin account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Admin Forgot Password Error:", error);
    res.status(500).json({
      error:
        "An error occurred while processing the admin password reset request.",
    });
  }
};

module.exports = {
  signupUser,
  loginUser,
  loginAdmin,
  signupAdmin,
  refreshToken,
  // createToken: createTokenWithExpiry, // Exporting createTokenWithExpiry might be confusing if not used elsewhere
  forgotPassword,
  resetPassword,
  adminForgotPassword, // Export the admin-specific forgot password handler
  verifyEmail,
};
