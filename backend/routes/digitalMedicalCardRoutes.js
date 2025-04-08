const express = require("express");
const router = express.Router();
const {
  getMedicalCard,
  createMedicalCard,
} = require("../controllers/digitalMedicalCardController");

// Middleware for authentication (replace with your actual one)
const requireAuth = require("../middleware/requireAuth");

// All routes below require user to be authenticated
router.use(requireAuth);

// @route GET /api/medical-card
// @desc Get the user's digital medical card (or prompt to create one)
// @access Private
router.get("/", getMedicalCard);

// @route POST /api/medical-card
// @desc Create a new digital medical card
// @access Private
router.post("/", createMedicalCard);

module.exports = router;
