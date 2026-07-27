const jwt = require("jsonwebtoken")

function protect (req, res, next) {

    let token = req.body.token
    try {

        let user = jwt.verify(token, process.env.JWT_SECRET)

        req.user = user

        next()
    } catch (err) {
       res.send(err.message)
    }

}

module.exports = {protect}