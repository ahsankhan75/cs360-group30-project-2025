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

module.exports = {
  getMedicalCard,
  createMedicalCard,
};
