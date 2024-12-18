
require('dotenv').config();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const nodemailer = require('nodemailer');
const crypto = require("crypto");


// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use the desired email service
    auth: {
      user: process.env.EMAIL, 
      pass: process.env.PASSWORD, 
    },
  });


//change password 
async function changePassword(userData) {
    const { userId, currentPassword, newPassword } = userData;
  
    if (!userId || !currentPassword || !newPassword) {
      return { status: 400, message: "All fields are required" };
    }
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return { status: 400, message: "User not found" };
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return { status: 400, message: "Incorrect Password, try again" };
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      return { status: 200, message: "Password changed successfully" };
    } catch (error) {
      return { status: 500, message: "Internal Server Error: " + error.message };
    }
  };


  //forgot password 
  async function forgotPassword(userData) {
    const {email} = userData;
    if(!email) {
        return {status:400,message:'Incorrect email'};
    }    
  }

  //send email 
  async function sendEmail(userEmail) {
    
  }
  module.exports = {
    changePassword,
    forgotPassword
  };
  