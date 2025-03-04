const { body, validationResult } = require("express-validator");
const { sendContactEmail } = require("../utils/emailService");

const validateContactForm = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("message").trim().notEmpty().withMessage("Message is required"),
];

async function submitContactForm(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, message } = req.body;

  try {
    await sendContactEmail(name, email, message);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later",
    });
  }
}

module.exports = {
  submitContactForm,
  validateContactForm,
};
