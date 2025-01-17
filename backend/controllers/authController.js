const User = require('../models/User');
const redisClient = require("../config/redisClient");
const { sendVerificationEmail } = require("../utils/emailService");

// Helper function for email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Signup request
const signup = async (req, res) => {
  const { username, name, email } = req.body;

  try {
    // Input validation
    if (!username || !name || !email) {
      return res.status(400).json({ 
        message: "Username, name, and email are required" 
      });
    }

    // Validate username
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        message: "Username must be between 3 and 30 characters"
      });
    }

    // Validate name
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({
        message: "Name must be between 2 and 50 characters"
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        message: "Invalid email format" 
      });
    }

    // Normalize inputs
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();
    const normalizedName = name.trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername }
      ]
    });

    if (existingUser) {
      return res.status(409).json({ 
        message: existingUser.email === normalizedEmail 
          ? "Email already registered" 
          : "Username already taken" 
      });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create new user
    const newUser = new User({
      username: normalizedUsername,
      name: normalizedName,
      email: normalizedEmail,
      verificationCode,
      verificationExpires,
      role: 'user'
    });

    // Save user to database
    await newUser.save();

    // Store verification code in Redis
    await redisClient.set(
      `signup:${normalizedEmail}`, 
      verificationCode, 
      "EX", 
      300
    );

    // Send verification email
    await sendVerificationEmail(normalizedEmail, verificationCode);

    res.status(201).json({
      message: "Signup successful. Please verify your email.",
      userId: newUser._id
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      message: "Failed to create account",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify signup
const verifySignup = async (req, res) => {
  const { email, code } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if verification code has expired
    if (user.verificationExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Verify code from Redis
    const redisCode = await redisClient.get(`signup:${normalizedEmail}`);
    
    if (code !== user.verificationCode || code !== redisCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Clear verification fields
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    // Clear Redis verification code
    await redisClient.del(`signup:${normalizedEmail}`);

    res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ 
      message: "Verification failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Request a verification code
const requestCode = async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Rate limiting check
    const attempts = await redisClient.get(`${normalizedEmail}_attempts`);
    if (attempts && parseInt(attempts) >= 3) {
      return res.status(429).json({ 
        message: "Too many attempts. Please try again later." 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user's verification code
    user.verificationCode = verificationCode;
    user.verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    // Store in Redis and update attempts
    await Promise.all([
      redisClient.set(normalizedEmail, verificationCode, "EX", 300),
      redisClient.incr(`${normalizedEmail}_attempts`),
      redisClient.expire(`${normalizedEmail}_attempts`, 3600)
    ]);

    // Send verification email
    await sendVerificationEmail(normalizedEmail, verificationCode);

    res.status(200).json({ 
      message: "Verification code sent successfully",
      expiresIn: "5 minutes"
    });
  } catch (error) {
    console.error("Error requesting verification code:", error);
    res.status(500).json({ 
      message: "Failed to send verification code",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify the entered code
const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check code expiration
    if (user.verificationExpires < new Date()) {
      return res.status(400).json({ message: "Code has expired" });
    }

    // Verify code from both MongoDB and Redis
    const redisCode = await redisClient.get(normalizedEmail);
    
    if (code !== user.verificationCode || code !== redisCode) {
      // Increment failed attempts
      await redisClient.incr(`${normalizedEmail}_failed`);
      const failedAttempts = await redisClient.get(`${normalizedEmail}_failed`);

      if (parseInt(failedAttempts) >= 3) {
        // Clear verification data after too many failed attempts
        user.verificationCode = null;
        user.verificationExpires = null;
        await user.save();
        await redisClient.del(normalizedEmail);
        
        return res.status(400).json({ 
          message: "Too many failed attempts. Please request a new code." 
        });
      }

      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Clear verification data
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    // Clean up Redis entries
    await Promise.all([
      redisClient.del(normalizedEmail),
      redisClient.del(`${normalizedEmail}_attempts`),
      redisClient.del(`${normalizedEmail}_failed`)
    ]);

    res.status(200).json({ 
      message: "Verification successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ 
      message: "Verification failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login with email verification
const login = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate verification code for login
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user's verification code
    user.verificationCode = verificationCode;
    user.verificationExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // Store code in Redis
    await redisClient.set(
      `login:${normalizedEmail}`, 
      verificationCode, 
      "EX", 
      300
    );

    // Send verification email
    await sendVerificationEmail(normalizedEmail, verificationCode);

    res.status(200).json({ 
      message: "Login verification code sent",
      userId: user._id
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Login failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  signup,
  verifySignup,
  requestCode,
  verifyCode,
  login
};