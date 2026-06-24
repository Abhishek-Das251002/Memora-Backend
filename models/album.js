const mongoose = require("mongoose")

const albumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GallaryUser",
        required: true,
    },
    sharedUsers: {
        type: [String],
        default: []
    }
},
{
    timestamps: true
})

const Album = mongoose.model("Album", albumSchema)

module.exports = {Album};

