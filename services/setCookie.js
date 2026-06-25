const setSecureCookie = (res, token) => {
    res.cookie('jwt_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/"
    })

    return res;
}

module.exports = {setSecureCookie}