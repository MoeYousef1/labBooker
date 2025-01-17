const redisClient = require("../config/redisClient");
const { sendVerificationEmail } = require("../utils/emailService");

// Request a verification code
const requestCode = async (req, res) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    console.log(`Requesting code for email: ${normalizedEmail}`);

    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    console.log(`Generated code: ${verificationCode}`);

    // Store the code in Redis with a 5-minute expiration time (300 seconds)
    await redisClient.set(normalizedEmail, verificationCode, "EX", 300);

    // Send the verification email
    await sendVerificationEmail(normalizedEmail, verificationCode);

    res.status(200).json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Error requesting verification code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify the entered code
const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  // Check if email and code are provided
  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    console.log(`Verifying code for email: ${normalizedEmail}, entered code: ${code}`);

    // Retrieve the stored code from Redis
    const storedCode = await redisClient.get(normalizedEmail);
    console.log(`Stored code for ${normalizedEmail}: ${storedCode}`);

    // Check if the code exists or has expired
    if (!storedCode) {
      return res.status(400).json({ message: "Code has expired or doesn't exist" });
    }

    // Compare the stored code with the entered code
    if (storedCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Delete the code after successful verification
    await redisClient.del(normalizedEmail);

    // Send success response
    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { requestCode, verifyCode };
