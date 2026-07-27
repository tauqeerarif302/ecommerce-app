const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    role: {
      type: String,
      enum: ["seller", "buyer"],
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      default: "",
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


// PRE HOOK (Hash Password)

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// POST HOOK (Send OTP Email)

userSchema.post("save", async function (doc) {
  try {
    if (doc.otp) {
      await sendEmail(
        doc.email,
        "OTP Verification",
        `Your OTP code is: ${doc.otp}. It will expire in 10 minutes.`
      );
    }
  } catch (error) {
    console.log("Email Error:", error.message);
  }
});

module.exports = mongoose.model("User", userSchema);