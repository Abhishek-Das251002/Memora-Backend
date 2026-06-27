const mongoose = require("mongoose")
require("dotenv").config()

const connectionUri = process.env.MONGODB_URI

async function connectToDb() {
    try {
        console.log("connecting to db...")

        const isConnected = await mongoose.connect(connectionUri)

        if(isConnected){
            console.log("connected to database.")
            console.log("readyState:", mongoose.connect.readyState)
        }else{
            console.log("failed to make Db connection.")
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports = {connectToDb}