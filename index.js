const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const express = require("express")
const { setSecureCookie } = require("./services/setCookie")
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const {connectToDb} = require("./dbConnection")

const app = express()
app.use(express.json())

connectToDb()

PORT = process.env.PORT || 3000
app.use(cors({credentials: true, origin: "https://memora-frontend-ashy.vercel.app"}))
app.use(cookieParser())

app.use("/auth", authRoutes)
app.use("/user", userRoutes)


app.listen(PORT, () => {
    console.log("backend is running on port", PORT)
})
