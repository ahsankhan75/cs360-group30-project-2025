const express = require("express");
const router = express.Router();
const {
    uploadProfilePhoto,
    deleteProfilePhoto,
    getUserProfilePhotos
} = require("../controllers/profilePhotoController");
const upload = require("../middleware/uploadMiddleware");
const requireAuth = require("../middleware/requireAuth");

// All routes require authentication
router.use(requireAuth);

// @route POST /api/profile-photos
// @desc Upload a new profile photo
// @access Private
router.post("/", upload.single('profilePicture'), uploadProfilePhoto);

// @route DELETE /api/profile-photos/:id
// @desc Delete a profile photo
// @access Private
router.delete("/:id", deleteProfilePhoto);

// @route GET /api/profile-photos
// @desc Get all profile photos for the current user
// @access Private
router.get("/", getUserProfilePhotos);

module.exports = router; 