const express = require("express")

const {googleLogin, googleCallback, logout} = require("../controllers/authController")

const router = express.Router()

router.get("/google", googleLogin)
router.get("/google/callback", googleCallback)
router.get("/logout", logout)

module.exports = router