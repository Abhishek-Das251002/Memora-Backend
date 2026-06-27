const mongoose = require("mongoose")
require("dotenv").config()

const connectionUri = process.env.MONGODB_URI

async function connectToDb() {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log("MongoDB already connected.");
            return;
        }

        // Connection in progress
        if (mongoose.connection.readyState === 2) {
            console.log("MongoDB connection is already in progress.");
            return;
        }
        console.log("connecting to db...")

        await mongoose.connect(connectionUri)

        console.log("connected to database.")
        console.log("readyState:", mongoose.connection.readyState)
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = {connectToDb}