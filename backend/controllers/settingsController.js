require("dotenv").config();
const bcrypt = require("bcrypt");
const UserCollection = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const uniqeId = crypto.randomBytes(3).toString("hex");
const { validatePassword } = require("../utils/validatePassword");
// Temporary in-memory storage for codes
const verificationCodes = new Map();

// Change password function
async function changePassword(userData) {
  const { email, currentPassword, newPassword } = userData;
  if (!email || !currentPassword || !newPassword) {
    return { status: 400, message: "All fields are required" };
  }

  try {
    const user = await UserCollection.findOne({ email });

    if (!user) {
      return { status: 400, message: "User not found" };
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { status: 400, message: "Incorrect Password, try again" };
    }
    validatePassword(newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { status: 200, message: "Password changed successfully" };
  } catch (error) {
    return { status: 500, message: "Internal Server Error: " + error.message };
  }
}

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Set to true for port 465
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.PASSWORD, // Your app password
  },
});

// Send email with verification code
async function sendVerificationCode(email) {
  const verificationCode = Math.floor(100000 + Math.random() * 900000); // Random 6-digit code
  const expirationTime = Date.now() + 3 * 60 * 1000; // 3 minutes from now

  // Store the code with the email
  verificationCodes.set(email, { verificationCode, expirationTime });

  const mailOptions = {
    from: {
      name: "Lab Booker",
      address: process.env.EMAIL,
    },
    to: email,
    subject: `${uniqeId}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0px 4px 6px rgba(0,0,0,0.1);">
        <div style="background-color: #4CAF50; color: white; text-align: center; padding: 20px;">
          <h1 style="margin: 0;">Lab Booker</h1>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="font-size: 16px; line-height: 1.5;">Your verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #4CAF50; text-align: center; margin: 20px 0; border: 2px dashed #4CAF50; padding: 10px;">
            ${verificationCode}
          </div>
          <p style="font-size: 16px; line-height: 1.5;">Please enter this code to verify your account. If you did not request this code, please ignore this email.</p>
          <p style="font-size: 16px; line-height: 1.5;">Thank you for using Lab Booker!</p>
        </div>
        <div style="background-color: #f4f4f4; text-align: center; padding: 10px; font-size: 12px; color: #666;">
          <p style="margin: 0;">© 2024 Lab Booker. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { status: 200, message: "Verification code sent successfully!" };
  } catch (error) {
    return {
      status: 500,
      message: "Failed to send verification code: " + error.message,
    };
  }
}

// Validate verification code
function validateVerificationCode(email, code) {
  const storedData = verificationCodes.get(email);

  if (!storedData) {
    return { status: 400, message: "Invalid or expired verification code" };
  }

  const { verificationCode, expirationTime } = storedData;

  if (Date.now() > expirationTime) {
    verificationCodes.delete(email);
    return { status: 400, message: "Verification code expired" };
  }

  if (parseInt(code, 10) !== verificationCode) {
    return { status: 400, message: "Incorrect verification code" };
  }

  // Code is valid; remove it from storage
  verificationCodes.delete(email);
  return { status: 200, message: "Verification successful" };
}

// Forgot Password Function
async function forgotPassword(userData) {
  const { email } = userData;

  if (!email) {
    return { status: 400, message: "Email is required" };
  }

  try {
    const user = await UserCollection.findOne({ email });

    if (!user) {
      return { status: 400, message: "User not found" };
    }

    // Send the verification code
    const response = await sendVerificationCode(email);

    if (response.status !== 200) {
      return { status: 500, message: "Failed to send verification email" };
    }

    return { status: 200, message: "Verification code sent successfully" };
  } catch (error) {
    return { status: 500, message: "Internal Server Error: " + error.message };
  }
}

// Reset Password Function
async function resetPassword(userData) {
  const { email, newPassword, confirmNewPassword } = userData;

  if (!email || !newPassword || !confirmNewPassword) {
    return { status: 400, message: "All fields are required" };
  }

  if (newPassword !== confirmNewPassword) {
    return { status: 400, message: "Passwords do not match" };
  }

  try {
    const user = await UserCollection.findOne({ email });

    if (!user) {
      return { status: 400, message: "User not found" };
    }
    const isValid = validatePassword(newPassword);
    if (isValid !== "Valid") {
      return { status: 400, message: "Password is invalid " };
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { status: 200, message: "Password reset successfully" };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Internal Server Error: " + error.message };
  }
}

module.exports = {
  forgotPassword,
  changePassword,
  sendVerificationCode,
  validateVerificationCode,
  resetPassword, // Add this to export the reset password function
};
