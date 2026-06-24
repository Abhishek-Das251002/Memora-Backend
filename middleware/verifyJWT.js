const jwt = require("jsonwebtoken")
const JWT_Secret = process.env.JWT_SECRET

const verifyJWT = (req, res, next) => {
    // console.log("jwt running.")
    // console.log(req.cookies)
    // console.log(req.cookies.jwt_token)
    // console.log(JWT_Secret)
    if(!req.cookies.jwt_token){
        return res.status(403).json({error: 'Access denied.'})
    }

    const token = req.cookies.jwt_token

    try{
        const decodedToken = jwt.verify(token, JWT_Secret)
        req.user = decodedToken
        //console.log("jwt passed")
        next()
    }catch(error){
        console.error(error)
        return res.status(401).json({message: "Invalid token."})
    }
}

module.exports = {verifyJWT}