// controllers/userController.js
const User = require("../models/User");
const authMiddleware = require('../middleware/authMiddleware');
const RedisClient = require('../utils/redisClient');
const crypto = require('crypto');

class UserController {
  constructor() {
    // Bind methods to ensure proper 'this' context
    this.sendVerificationCode = this.sendVerificationCode.bind(this);
    this.verifyCodeAndLogin = this.verifyCodeAndLogin.bind(this);
    this.resendVerificationCode = this.resendVerificationCode.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
    this.getUserCount = this.getUserCount.bind(this);
    this.getUserProfile = this.getUserProfile.bind(this);
    this.updateUserProfile = this.updateUserProfile.bind(this);
  }

  // Send verification code
  async sendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate verification code
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const codeExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Update user with verification code
      user.verificationCode = verificationCode;
      user.verificationExpires = codeExpiration;
      await user.save();

      // In a real application, you would send this via email
      // For testing, we'll just return it
      return res.status(200).json({
        message: "Verification code sent",
        verificationCode, // Remove this in production
        codeExpiration: codeExpiration.toISOString()
      });
    } catch (error) {
      console.error('Send verification code error:', error);
      return res.status(500).json({ 
        message: "Failed to send verification code", 
        error: error.message 
      });
    }
  }

  // Verify code and login
  async verifyCodeAndLogin(req, res) {
    try {
      const { email, verificationCode } = req.body;

      if (!email || !verificationCode) {
        return res.status(400).json({ 
          message: "Email and verification code are required" 
        });
      }

      const user = await User.findOne({ 
        email,
        verificationCode,
        verificationExpires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(401).json({ 
          message: "Invalid or expired verification code" 
        });
      }

      // Clear verification code
      user.verificationCode = null;
      user.verificationExpires = null;
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = await authMiddleware.generateTokens(user);

      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Verify code error:', error);
      return res.status(500).json({ 
        message: "Verification failed", 
        error: error.message 
      });
    }
  }

  // Resend verification code
  async resendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate new verification code
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const codeExpiration = new Date(Date.now() + 15 * 60 * 1000);

      user.verificationCode = verificationCode;
      user.verificationExpires = codeExpiration;
      await user.save();

      // In production, send via email
      return res.status(200).json({
        message: "New verification code sent",
        verificationCode, // Remove in production
        codeExpiration: codeExpiration.toISOString()
      });
    } catch (error) {
      console.error('Resend code error:', error);
      return res.status(500).json({ 
        message: "Failed to resend code", 
        error: error.message 
      });
    }
  }

  // Fetch users (protected route)
  async fetchUsers(req, res) {
    try {
      const users = await User.find().select('-verificationCode -verificationExpires');
      return res.status(200).json(users);
    } catch (error) {
      console.error('Fetch users error:', error);
      return res.status(500).json({ 
        message: "Failed to fetch users", 
        error: error.message 
      });
    }
  }

  // Get user count
  async getUserCount(req, res) {
    try {
      const count = await User.countDocuments();
      return res.status(200).json({ count });
    } catch (error) {
      console.error('Get user count error:', error);
      return res.status(500).json({ 
        message: "Failed to get user count", 
        error: error.message 
      });
    }
  }

  // Get user profile
  async getUserProfile(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .select('-verificationCode -verificationExpires');
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ 
        message: "Failed to get profile", 
        error: error.message 
      });
    }
  }

  // Update user profile
  async updateUserProfile(req, res) {
    try {
      const { username, email } = req.body;

      if (!username && !email) {
        return res.status(400).json({ 
          message: "Nothing to update" 
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { username, email } },
        { new: true }
      ).select('-verificationCode -verificationExpires');

      return res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ 
        message: "Failed to update profile", 
        error: error.message 
      });
    }
  }
}

// Export a single instance
module.exports = new UserController();