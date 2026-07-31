const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Product = require("../models/Product")

// =========================
// Signup
// =========================

const signup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      age,
      gender,
      role,
      address,
      city,
      country,
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Create User
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      age,
      gender,
      role,
      address,
      city,
      country,
      otp,
      otpExpiry,
    });

    res.status(201).json({
      success: true,
      message: "Signup Successful. OTP sent to your email.",
    });

  } catch (error) {

    console.log("========== SIGNUP ERROR ==========");
    console.log(error);
    console.log(error.stack);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Verify OTP
// =========================

const verifyOTP = async (req, res) => {
  try {

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP Expired",
      });
    }

    user.isVerified = true;
    user.otp = "";
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({
      message: "OTP Verified Successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// Login
// =========================

const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify OTP first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      name: user.fullName,
      token,
      role: user.role,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

function abc () {
  
}

module.exports = {
  signup,
  verifyOTP,
  login,
};