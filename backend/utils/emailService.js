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
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background-color: #f4f7fa;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }

            .email-container {
              background-color: #ffffff;
              max-width: 580px;
              margin: 24px auto;
              border-radius: 16px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
              overflow: hidden;
            }

            .email-header {
              background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
              padding: 36px 0;
              text-align: center;
            }

            .company-logo {
              font-size: 28px;
              font-weight: 800;
              color: #ffffff;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }

            .email-body {
              padding: 48px 40px;
              color: #2d3748;
            }

            .greeting {
              font-size: 26px;
              font-weight: 700;
              margin: 0 0 28px 0;
              color: #1a202c;
            }

            .message {
              font-size: 16px;
              line-height: 1.7;
              margin: 0 0 32px 0;
              color: #4a5568;
            }

            .verification-code-container {
              background: linear-gradient(to right, #f7fafc, #edf2f7);
              border-radius: 12px;
              padding: 32px;
              text-align: center;
              margin-bottom: 36px;
              border: 1px solid #e2e8f0;
            }

            .verification-code {
              font-family: 'Monaco', 'Courier New', monospace;
              font-size: 36px;
              font-weight: 700;
              color: #2d3748;
              letter-spacing: 6px;
              margin: 0;
              text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
            }

            .verification-note {
              font-size: 14px;
              color: #718096;
              margin-top: 16px;
              font-weight: 500;
            }

            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e2e8f0, transparent);
              margin: 36px 0;
            }

            .email-footer {
              padding: 28px 40px;
              background-color: #f8fafc;
              text-align: center;
              border-top: 1px solid #edf2f7;
            }

            .footer-text {
              font-size: 13px;
              color: #718096;
              margin: 0;
              line-height: 1.6;
            }

            .help-text {
              margin-top: 20px;
              padding: 20px;
              background-color: #f8fafc;
              border-radius: 12px;
              font-size: 14px;
              color: #718096;
              border: 1px solid #edf2f7;
            }

            .highlight {
              color: #4299e1;
              font-weight: 500;
              text-decoration: none;
              transition: color 0.2s ease;
            }

            .highlight:hover {
              color: #2b6cb0;
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

const sendContactEmail = async (name, email, message) => {
  try {
    // Email to support
    await sendEmail(
      process.env.SUPPORT_EMAIL, // Add SUPPORT_EMAIL to your .env
      `New Contact Form Submission from ${name}`,
      `
        <h3>New Message from ${name}</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space: pre-wrap">${message}</div>
        <hr>
        <p>Received at: ${new Date().toLocaleString()}</p>
      `,
    );

    // Confirmation email to user
    await sendEmail(
      email,
      "We Received Your Message",
      `
        <h3>Thank you, ${name}!</h3>
        <p>Your message has been received by our support team.</p>
        <p><strong>Your message:</strong></p>
        <div style="white-space: pre-wrap">${message}</div>
        <hr>
        <p>We aim to respond within 24-48 hours.</p>
        <p style="color: #666; font-size: 0.9em;">
          This is an automated message - please do not reply directly to this email.
        </p>
      `,
    );
  } catch (error) {
    console.error("Error sending contact email:", error);
    throw error;
  }
};

const sendBookingConfirmation = async (userEmail, userName, bookingDetails) => {
  const subject = "Booking Confirmed 🎉";
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Inter', sans-serif;">
      <div style="background: #f8fafc; padding: 2rem; border-radius: 1rem;">
        <h1 style="color: #1a365d; font-size: 1.5rem; margin-bottom: 1rem;">
          Hi ${userName}, your booking is confirmed!
        </h1>
        
        <div style="background: white; padding: 1.5rem; border-radius: 0.5rem;">
          <h2 style="font-size: 1.25rem; color: #2d3748; margin-bottom: 1rem;">Booking Details</h2>
          <p style="margin: 0.5rem 0;">
            <strong>Room:</strong> ${bookingDetails.roomName}<br>
            <strong>Date:</strong> ${bookingDetails.date}<br>
            <strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}
          </p>
        </div>

        <p style="margin: 1.5rem 0; color: #4a5568;">
          Need to make changes? Visit your 
          <a href="${process.env.CLIENT_URL}/my-bookings" style="color: #4299e1; text-decoration: none;">
            bookings dashboard
          </a>
        </p>
      </div>
    </div>
  `;

  await sendEmail(userEmail, subject, html);
};

const sendPendingConfirmation = async (userEmail, userName, bookingDetails) => {
  const subject = "Booking Pending Review ⏳";
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Inter', sans-serif;">
      <div style="background: #f8fafc; padding: 2rem; border-radius: 1rem;">
        <h1 style="color: #1a365d; font-size: 1.5rem; margin-bottom: 1rem;">
          Hi ${userName}, your booking request has been received
        </h1>
        
        <div style="background: white; padding: 1.5rem; border-radius: 0.5rem;">
          <h2 style="font-size: 1.25rem; color: #2d3748; margin-bottom: 1rem;">Request Details</h2>
          <p style="margin: 0.5rem 0;">
            <strong>Room:</strong> ${bookingDetails.roomName}<br>
            <strong>Date:</strong> ${bookingDetails.date}<br>
            <strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}
          </p>
        </div>

        <p style="margin: 1.5rem 0; color: #4a5568;">
          Your request for the Large Seminar Room is under review. 
          We'll notify you once it's approved by our team.
        </p>
      </div>
    </div>
  `;

  await sendEmail(userEmail, subject, html);
};

const sendAdminApprovalRequest = async (bookingDetails, userDetails) => {
  const subject = "New Large Seminar Room Request 🚨";
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Inter', sans-serif;">
      <div style="background: #fef2f2; padding: 2rem; border-radius: 1rem;">
        <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">
          New Large Seminar Room Request
        </h1>
        
        <div style="background: white; padding: 1.5rem; border-radius: 0.5rem;">
          <h2 style="font-size: 1.25rem; color: #2d3748; margin-bottom: 1rem;">Request Details</h2>
          <p style="margin: 0.5rem 0;">
            <strong>User:</strong> ${userDetails.name} (${userDetails.email})<br>
            <strong>Room:</strong> ${bookingDetails.roomName}<br>
            <strong>Date:</strong> ${bookingDetails.date}<br>
            <strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}
          </p>
        </div>

        <p style="margin: 1.5rem 0; color: #4a5568;">
          <a href="${process.env.CLIENT_URL}/admin/bookings/${bookingDetails.id}" 
             style="background: #dc2626; color: white; padding: 0.5rem 1rem; 
                    border-radius: 0.375rem; text-decoration: none;">
            Review Booking Request
          </a>
        </p>
      </div>
    </div>
  `;

  await sendEmail(process.env.SUPPORT_EMAIL, subject, html);
};

module.exports = { sendVerificationEmail, sendContactEmail, sendAdminApprovalRequest, sendBookingConfirmation, sendPendingConfirmation, sendEmail };
