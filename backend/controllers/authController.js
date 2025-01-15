const User = require("../models/User");
const speakeasy = require("speakeasy");
const sendVerificationEmail = require("../utils/emailService");

// Request Verification Code - Controller Function
const requestCode = async (req, res) => {
  const { email } = req.body;

  // Check if the email exists in the database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Generate a verification code using speakeasy
  const verificationCode = speakeasy.totp({
    secret: process.env.JWT_SECRET,  // Ensure this is defined in your .env
    encoding: "base32",
  });

  // Send the verification code to the user's email
  try {
    await sendVerificationEmail(email, verificationCode);
    res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ message: "Error sending verification email" });
  }
};

// Verify the Code - Controller Function
const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  // Check if the email exists in the database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Retrieve the secret from the user (this should be securely stored in your user model)
  const secret = process.env.JWT_SECRET;

  // Verify the code using speakeasy
  const isVerified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: code,  // The code entered by the user
  });

  if (isVerified) {
    // Successfully verified, you can generate a JWT or do something else
    res.status(200).json({ message: "Verification successful" });
  } else {
    res.status(400).json({ message: "Invalid verification code" });
  }
};

module.exports = {
  requestCode,
  verifyCode,
};
