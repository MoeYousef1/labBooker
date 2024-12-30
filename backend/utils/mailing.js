// const mongoose = require("mongoose");
// const nodemailer = require("nodemailer");
// const User = require("../models/User");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // Set to true for port 465
//   auth: {
//     user: process.env.EMAIL, // Your email address
//     pass: process.env.PASSWORD, // Your app password
//   },
// });

// const mailing = async (subject , text) => {
//   try {
//     const users = await User.findOne({ email });
//     if (!user) {
//       return { status: 400, message: "no users found in the database" };
//     }
//       // Send emails to each user
//       for (const user of users) {
//         const email = user.email;
//         if (email) {
//           try {
//             await sendMail(
//               email,
//               'Subject: Important Update',
//               '<h1>Hello!</h1><p>This is a test email sent to all users.</p>'
//             );
//             console.log(`Email sent to: ${email}`);
//           } catch (err) {
//             console.error(`Failed to send email to ${email}:`, err);
//           }
//         }
//       }
//       console.log("All emails sent successfully");  

//   } catch (error) {
//     console.error("Error sending emails: " + error.message);
//     return { status: 500, message: "Internal Server Error: " + error.message };
//   }
// };
// module.exports = { mailing };
