const mongoose = require("mongoose")

const imageSchema = new mongoose.Schema({
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: []
    },
    person: {
        type: [String],
        default: []
    },
    isFavorite: {
        type: [String],
        default: []
    },
    comments: {
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "GallaryUser"
            },
            text: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
        }],
        default: []
    },
    size: {
        type: Number,
        required: true,
    },
    uploadedBy: {
        type: String,
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    }
})

const Image = mongoose.model("Image", imageSchema)

module.exports = {Image}