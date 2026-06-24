const mongoose = require("mongoose")
require("dotenv").config()

const connectionUri = process.env.MONGODB_URI

async function connectToDb() {
    try {
        const isConnected = await mongoose.connect(connectionUri)

        if(isConnected){
            console.log("connect to database.")
        }else{
            console.log("failed to make Db connection.")
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports = {connectToDb}