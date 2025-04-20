const express = require("express");
const router = express.Router();
const {
  getMedicalCard,
  createMedicalCard,
  updateMedicalCard,
  uploadProfilePicture,
  removeProfilePicture,
} = require("../controllers/digitalMedicalCardController");

// Import upload middleware
const upload = require("../middleware/uploadMiddleware");

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

// @route PUT /api/medical-card
// @desc Update an existing digital medical card
// @access Private
router.put("/", updateMedicalCard);

// @route POST /api/medical-card/profile-picture
// @desc Upload profile picture for medical card
// @access Private
router.post("/profile-picture", upload.single('profilePicture'), uploadProfilePicture);

// @route DELETE /api/medical-card/profile-picture
// @desc Remove profile picture from medical card
// @access Private
router.delete("/profile-picture", removeProfilePicture);

// Serve uploaded files statically
router.use('/uploads', express.static('uploads'));

module.exports = router;
