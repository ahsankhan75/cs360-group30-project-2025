const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({ email, token });
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

module.exports = { signupUser, loginUser, loginAdmin, signupAdmin };
