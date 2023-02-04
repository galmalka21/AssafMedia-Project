const {sign , verify} = require('jsonwebtoken')

function createTokens(username){
    const accessToken = sign({
        username: username}
        ,"changemefromenvfile")

    return accessToken
}

function validateToken(req , res, next){
    const accessToken = req.cookies["access-token"]

    if(!accessToken)
        return res.status(400).json({error: "User not authenticated!"})
    
    try {
        const validToken = verify(accessToken, "changemefromenvfile")
        if(validToken) {
            req.authenticated = true
            return next()
        } else {

        }
    } catch(err) {
        return res.status(400).json({error: err})
    }
    
}

module.exports = { createTokens , validateToken }