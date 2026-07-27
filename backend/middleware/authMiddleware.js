const jwt = require("jsonwebtoken");

const signUpMiddleware = (req, res, next) => {
  try{
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    let email = req.body.email
    let pass = req.body.password
    let phone = req.body.phone
    let age = req.body.age

    if(!emailRegex.test(email)){
      return res.json({
        message: "Email is invalid"
      })
    }

    if(pass.length < 6){
      return res.json({
        message: "Password is too short. Must contain 6 or more characters."
      })
    }

    if(phone.length < 11 || phone.length > 11){
      return res.json({
        message: "Phone number is invalid!"
      })
    }

    if(age <= 0){
      return res.json({
        message: "Age is invalid."
      })
    }
    
  }catch(err){
      console.log("======Error in signupmiddlware======")
      console.log(err.message)
  }
}




const authMiddleware = (req, res, next) => {
  try {
    // Authorization Header
    const authHeader = req.headers.authorization;

    // Check Token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access Denied. No Token Provided.",
      });
    }

    // Extract Token
    const token = authHeader.split(" ")[1];

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save User Data in Request
    req.user = decoded;

    // Go to Next Middleware/Controller
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or Expired Token",
    });
  }
};

module.exports = {
  authMiddleware,
  signUpMiddleware
}