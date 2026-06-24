const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    userPic: {
        type: String
    }
})

const GallaryUser = mongoose.model("GallaryUser", userSchema)

module.exports = {GallaryUser}