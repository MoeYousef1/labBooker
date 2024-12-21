
require('dotenv').config();
const bcrypt = require("bcrypt");
const UserCollection = require("../models/User");
const nodemailer = require('nodemailer');
const crypto = require("crypto");



//change password 
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

  
// // Create a transporter
// const transporter = nodemailer.createTransport({
//     service: 'gmail', // Use the desired email service
//     auth: {
//       user: process.env.EMAIL, 
//       pass: process.env.PASSWORD, 
//     },
//   });


//  const transport =  nodemailer.createTransport( {
//     host:'mxslurp.click',
//     port:'2525',
//     secure:false,
//     auth: {
//       useR:'362b2a08-9f3f-4c9b-bfcc-4d45e3981fcc@mailslurp.biz' ,
//       pass: '2txbIS9ILsfi4OcyyilGmzFEqACpassW'
//     }
//   })

//   transport.sendMail({
//     subject: 'test email',
//     text:'hello world',
//     from:'362b2a08-9f3f-4c9b-bfcc-4d45e3981fcc@mailslurp.biz ',
//     to: '362b2a08-9f3f-4c9b-bfcc-4d45e3981fcc@mailslurp.biz '
//   }).then ( ()=> {
//     console.log('email is sent');
//   }).catch((err=> { 
//     console.error(err);
//   }))
//   //send email 
//   async function verficationMail(userEmail) {
    
//   }
  module.exports = {
    changePassword,
    forgotPassword
  };
  