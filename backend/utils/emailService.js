// ./utils/emailService.js

const nodemailer = require("nodemailer");
const User = require("../models/User");

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Set to true for port 465
  auth: {
    user: process.env.EMAIL, // Your email address from the environment variable
    pass: process.env.PASSWORD, // Your app password from the environment variable
  },
});

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL, // Sender email address
      to,                      // Recipient email address
      subject,                 // Subject of the email
      html,                    // HTML email body
    });

    console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error("Error sending email");
  }
};

// Function to send verification email
const sendVerificationEmail = async (email, code) => {
  try {
    const subject = "Your Verification Code";
    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .email-container {
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              width: 100%;
              max-width: 600px;
              margin: 30px auto;
            }
            .email-header {
              background-color: #007BFF;
              color: white;
              text-align: center;
              padding: 10px 0;
              border-radius: 8px 8px 0 0;
            }
            .email-body {
              padding: 20px;
              font-size: 16px;
              line-height: 1.5;
              color: #333;
            }
            .email-footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #888;
            }
            .verification-code {
              font-size: 24px;
              font-weight: bold;
              color: #DC3545;
              padding: 10px;
              background-color: #f8d7da;
              border-radius: 5px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>Your Verification Code</h2>
            </div>
            <div class="email-body">
              <p>Hi there!</p>
              <p>Thank you for requesting a verification code. Please find your code below:</p>
              <p class="verification-code">${code}</p>
              <p>This code is valid for the next 5 minutes. Please enter it to proceed.</p>
            </div>
            <div class="email-footer">
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(email, subject, html);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

module.exports = { sendVerificationEmail };
