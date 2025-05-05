const ProfilePhoto = require('../models/profile_photo');
const fs = require('fs');
const path = require('path');

// @desc Upload a new profile photo
// @route POST /api/profile-photos
// @access Private
const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        // Create a new profile photo document
        const profilePhoto = new ProfilePhoto({
            userId: req.user._id,
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`,
            mimeType: req.file.mimetype,
            size: req.file.size
        });

        await profilePhoto.save();

        return res.status(201).json({
            message: "Profile photo uploaded successfully.",
            profilePhoto
        });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        return res.status(500).json({
            message: "Server error while uploading profile photo.",
            error: error.message
        });
    }
};

// @desc Delete a profile photo
// @route DELETE /api/profile-photos/:id
// @access Private
const deleteProfilePhoto = async (req, res) => {
    try {
        const profilePhoto = await ProfilePhoto.findById(req.params.id);

        if (!profilePhoto) {
            return res.status(404).json({ message: "Profile photo not found." });
        }

        // Check if the user owns this photo
        if (profilePhoto.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this photo." });
        }

        // Delete the file from the filesystem
        const filePath = path.join(__dirname, '..', 'uploads', profilePhoto.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete the document from the database
        await ProfilePhoto.findByIdAndDelete(req.params.id);

        return res.status(200).json({ message: "Profile photo deleted successfully." });
    } catch (error) {
        console.error('Error deleting profile photo:', error);
        return res.status(500).json({
            message: "Server error while deleting profile photo.",
            error: error.message
        });
    }
};

// @desc Get all profile photos for a user
// @route GET /api/profile-photos
// @access Private
const getUserProfilePhotos = async (req, res) => {
    try {
        const profilePhotos = await ProfilePhoto.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json(profilePhotos);
    } catch (error) {
        console.error('Error fetching profile photos:', error);
        return res.status(500).json({
            message: "Server error while fetching profile photos.",
            error: error.message
        });
    }
};

module.exports = {
    uploadProfilePhoto,
    deleteProfilePhoto,
    getUserProfilePhotos
}; 