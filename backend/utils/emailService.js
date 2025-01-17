// ./utils/emailService.js

const nodemailer = require("nodemailer");
const User = require("../models/User");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html,
    });
    console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error("Error sending email");
  }
};

const sendVerificationEmail = async (email, code) => {
  try {
    const subject = "Verify Your Email Address";
    const html = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', Arial, sans-serif;
              background-color: #f8fafc;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            .email-container {
              background-color: #ffffff;
              max-width: 600px;
              margin: 40px auto;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              overflow: hidden;
            }
            
            .email-header {
              background-color: #0f172a;
              padding: 32px 0;
              text-align: center;
            }
            
            .company-logo {
              font-size: 24px;
              font-weight: 700;
              color: #ffffff;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .email-body {
              padding: 40px;
              color: #1e293b;
            }
            
            .greeting {
              font-size: 24px;
              font-weight: 600;
              margin: 0 0 24px 0;
              color: #0f172a;
            }
            
            .message {
              font-size: 16px;
              line-height: 1.6;
              margin: 0 0 32px 0;
              color: #475569;
            }
            
            .verification-code-container {
              background-color: #f1f5f9;
              border-radius: 8px;
              padding: 24px;
              text-align: center;
              margin-bottom: 32px;
            }
            
            .verification-code {
              font-family: 'Courier New', monospace;
              font-size: 32px;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: 4px;
              margin: 0;
            }
            
            .verification-note {
              font-size: 14px;
              color: #64748b;
              margin-top: 16px;
            }
            
            .divider {
              height: 1px;
              background-color: #e2e8f0;
              margin: 32px 0;
            }
            
            .email-footer {
              padding: 24px 40px;
              background-color: #f8fafc;
              text-align: center;
            }
            
            .footer-text {
              font-size: 14px;
              color: #64748b;
              margin: 0;
              line-height: 1.5;
            }
            
            .help-text {
              margin-top: 16px;
              padding: 16px;
              background-color: #f8fafc;
              border-radius: 8px;
              font-size: 14px;
              color: #64748b;
            }
            
            .highlight {
              color: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <div class="company-logo">Lab Booker</div>
            </div>
            
            <div class="email-body">
              <h1 class="greeting">Verify your email address</h1>
              
              <p class="message">
                Thanks for getting started with Lab Booker! To complete your registration, 
                please enter the following verification code:
              </p>
              
              <div class="verification-code-container">
                <p class="verification-code">${code}</p>
                <p class="verification-note">This code will expire in 5 minutes</p>
              </div>
              
              <p class="message">
                If you didn't request this code, you can safely ignore this email. Someone might have 
                typed your email address by mistake.
              </p>
              
              <div class="help-text">
                Need help? Contact our support team at <span class="highlight">support@labbooker.com</span>
              </div>
              
              <div class="divider"></div>
              
              <p class="message" style="font-size: 14px;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
            
            <div class="email-footer">
              <p class="footer-text">
                © ${new Date().getFullYear()} YourCompany. All rights reserved.
              </p>
              <p class="footer-text">
                Azrieli college Inc., Jerusalem, Israel
              </p>
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