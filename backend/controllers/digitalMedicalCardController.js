const DigitalMedicalCard = require("../models/digital_medical_card");

// @desc Get or check for a user's digital medical card
// @route GET /api/medical-card
// @access Private
const getMedicalCard = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const existingCard = await DigitalMedicalCard.findOne({ email: userEmail });

    if (!existingCard) {
      return res
        .status(204)
        .json({
          message: "No digital medical card found. Prompt user to fill form.",
        });
    }

    return res.status(200).json(existingCard);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error while fetching medical card.", error });
  }
};

// @desc Create a new digital medical card
// @route POST /api/medical-card
// @access Private
const createMedicalCard = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const existingCard = await DigitalMedicalCard.findOne({ email: userEmail });

    if (existingCard) {
      return res
        .status(400)
        .json({
          message: "Digital medical card already exists for this user.",
        });
    }

    const newCard = new DigitalMedicalCard({ ...req.body, email: userEmail });
    await newCard.save();

    return res.status(201).json(newCard);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error while creating medical card.", error });
  }
};

// @desc Update an existing digital medical card
// @route PUT /api/medical-card
// @access Private
const updateMedicalCard = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const existingCard = await DigitalMedicalCard.findOne({ email: userEmail });

    if (!existingCard) {
      return res
        .status(404)
        .json({
          message: "No digital medical card found to update.",
        });
    }

    // Update the card with the new data
    Object.keys(req.body).forEach(key => {
      // Handle nested objects like primaryEmergencyContact
      if (typeof req.body[key] === 'object' && req.body[key] !== null) {
        existingCard[key] = { ...existingCard[key], ...req.body[key] };
      } else {
        existingCard[key] = req.body[key];
      }
    });

    await existingCard.save();

    return res.status(200).json(existingCard);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error while updating medical card.", error });
  }
};

// @desc Upload profile picture for medical card
// @route POST /api/medical-card/profile-picture
// @access Private
const uploadProfilePicture = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const existingCard = await DigitalMedicalCard.findOne({ email: userEmail });

    if (!existingCard) {
      return res
        .status(404)
        .json({
          message: "No digital medical card found to update.",
        });
    }

    // Get the file path relative to the server
    const filePath = `/uploads/${req.file.filename}`;

    // Update the profile picture field
    existingCard.profilePicture = filePath;
    await existingCard.save();

    return res.status(200).json({
      message: "Profile picture uploaded successfully.",
      profilePicture: filePath,
      card: existingCard
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error while uploading profile picture.", error });
  }
};

// @desc Remove profile picture from medical card
// @route DELETE /api/medical-card/profile-picture
// @access Private
const removeProfilePicture = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const existingCard = await DigitalMedicalCard.findOne({ email: userEmail });

    if (!existingCard) {
      return res
        .status(404)
        .json({
          message: "No digital medical card found to update.",
        });
    }

    // Remove the profile picture field
    existingCard.profilePicture = "";
    await existingCard.save();

    return res.status(200).json({
      message: "Profile picture removed successfully.",
      card: existingCard
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error while removing profile picture.", error });
  }
};

module.exports = {
  getMedicalCard,
  createMedicalCard,
  updateMedicalCard,
  uploadProfilePicture,
  removeProfilePicture,
};
