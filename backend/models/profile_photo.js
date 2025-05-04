const mongoose = require("mongoose");

const ProfilePhotoSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ProfilePhoto", ProfilePhotoSchema); 