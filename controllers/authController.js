const axios = require("axios")
const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")
const {setSecureCookie} = require("../services/setCookie")
const { GallaryUser } = require("../models/user")

dotenv.config()
PORT = process.env.PORT || 3000
const JWT_Secret = process.env.JWT_SECRET

const googleLogin = (req, res) => {
    const googleAuthUrl =`https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=https://memora-frontend-ashy.vercel.app/auth/google/callback&response_type=code&scope=profile email`

    res.redirect(googleAuthUrl)
}

const googleCallback = async (req, res) => {
    const {code} = req.query;
    if(!code){
        return res.status(400).send("Authorization code not provided.")
    }

    try {
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token",
            {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `https://memora-frontend-ashy.vercel.app/auth/google/callback`,
            },
            {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }
        )

        const accessToken = tokenResponse.data.access_token;

        const googleUserDataResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', 
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }  
            }
        )

        console.log(googleUserDataResponse)

        function createToken(user){
            const token = jwt.sign({userId: user._id, name: user.name, email: user.email, userImg: user.userPic}, JWT_Secret, {expiresIn: "24h"})
            setSecureCookie(res, token)
            return res.redirect(`${process.env.FRONTEND_URL}/dashboard`)
        }

        const userExist = await GallaryUser.findOne({email: googleUserDataResponse.data.email})

        if(userExist){
            createToken(userExist)
        }else{
            const addNewUser = new GallaryUser({userId: googleUserDataResponse.data.id, name: googleUserDataResponse.data.name, email: googleUserDataResponse.data.email, userPic: googleUserDataResponse.data.picture})
            const saveNewUser = await addNewUser.save()

            if(saveNewUser){
                createToken(saveNewUser)
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            error: "Google authentication failed."
        })
    }
}

const logout = async (req, res) => {
    res.clearCookie("jwt_token");
    res.status(200).json({message: "Logged out successfully."})
}

module.exports = {googleLogin, googleCallback, logout}