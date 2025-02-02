// controllers/userController.js
const redisClient  = require('../utils/redisClient');
const User = require("../models/User");
const authMiddleware = require('../middleware/authMiddleware');
const uploadMulter = require("../middleware/multer");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const crypto = require('crypto');
const { sendVerificationEmail } = require("../utils/emailService");


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
    this.checkEmailAvailability = this.checkEmailAvailability.bind(this);
    this.initiateEmailChange = this.initiateEmailChange.bind(this);
    this.verificationCode= this.verifyEmailChange.bind(this);
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

  // controllers/userController.js

async updateUserProfile(req, res) {
  return new Promise((resolve, reject) => {
    uploadMulter(req, res, async (err) => {
      if (err) {
        console.error("Error uploading file:", err.message);
        return res.status(500).json({ message: "Failed to upload file" });
      }

      try {
        const { name, removeImage } = req.body; // parse removeImage from form data
        let profilePicture;

        const user = await User.findById(req.user._id);

        // If removeImage is true, remove from Cloudinary and set profilePicture to null
        if (removeImage === "true" || removeImage === true) {
          if (user.profilePicture) {
            try {
              const publicId = user.profilePicture.split('/').pop().split('.')[0];
              await cloudinary.uploader.destroy(`profile-pictures/${publicId}`); 
              // NOTE: If you previously stored the entire path or public_id differently,
              // you might need to parse it differently. 
            } catch (err) {
              console.error("Error removing image from Cloudinary:", err.message);
            }
          }
          user.profilePicture = null;
        }

        // Handle new file upload if present
        if (req.file) {
          // If the user currently has a picture, optionally remove it
          if (user.profilePicture && !removeImage) {
            try {
              const publicId = user.profilePicture.split('/').pop().split('.')[0];
              await cloudinary.uploader.destroy(`profile-pictures/${publicId}`);
            } catch (uploadError) {
              console.error("Error removing old image:", uploadError);
            }
          }

          // Upload the new image
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "profile-pictures"
          });
          fs.unlinkSync(req.file.path); // Remove temp file
          profilePicture = result.secure_url;
          user.profilePicture = profilePicture;
        }

        // Update name if provided
        if (name) {
          user.name = name;
        }

        await user.save();

        const updatedUser = user.toObject();
        delete updatedUser.verificationCode;
        delete updatedUser.verificationExpires;
        delete updatedUser.emailChangeRequest;

        return res.status(200).json({
          message: "Profile updated successfully",
          user: updatedUser,
        });
      } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
          message: "Failed to update profile",
          error: error.message,
        });
      }
    });
  });
}

// Check email availability
async checkEmailAvailability(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ 
      email,
      _id: { $ne: req.user._id } // Exclude current user
    });
    
    return res.status(200).json({
      available: !existingUser
    });
  } catch (error) {
    console.error("Check email availability error:", error);
    return res.status(500).json({
      message: "Failed to check email availability",
      error: error.message
    });
  }
}

// Initiate email change
async initiateEmailChange(req, res) {
  try {
    const { newEmail } = req.body;
    const userId = req.user._id;

    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }

    // Basic email validation (or use your existing validator)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if newEmail is taken by another user
    const existingUser = await User.findOne({
      email: newEmail.toLowerCase(),
      _id: { $ne: userId },
    });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Generate a 6-digit code (same style you do for login)
    const verificationCode = (Math.floor(100000 + Math.random() * 900000)).toString();

    // Save to Redis. Ex: expire after 5 minutes (300s)
    await redisClient.set(`changeEmail:${userId}`, verificationCode, "EX", 300);
    await redisClient.set(`changeEmail:newEmail:${userId}`, newEmail, "EX", 300);

    // Send verification email to the OLD (current) email address instead of newEmail
    await sendVerificationEmail(req.user.email, verificationCode);

    // Respond to client
    return res.status(200).json({
      message: "Verification code sent to your current email address",
      // verificationCode, // remove in production
    });
  } catch (error) {
    console.error("initiateEmailChange error:", error);
    return res.status(500).json({
      message: "Failed to initiate email change",
      error: error.message,
    });
  }
}

 // Verify email change
async verifyEmailChange(req, res) {
  try {
    const { verificationCode } = req.body;
    const userId = req.user._id;

    if (!verificationCode) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    // 1) Retrieve code from Redis
    const storedCode = await redisClient.get(`changeEmail:${userId}`);
    if (!storedCode) {
      return res
        .status(400)
        .json({ message: "No active email change request or code expired" });
    }

    // 2) Compare
    if (storedCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // 3) Retrieve the pending newEmail
    const pendingNewEmail = await redisClient.get(`changeEmail:newEmail:${userId}`);
    if (!pendingNewEmail) {
      return res
        .status(400)
        .json({ message: "Could not find pending new email. Please try again." });
    }

    // 4) Update user's email in DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Double-check if that email is still free (optional)
    const emailInUse = await User.findOne({
      email: pendingNewEmail.toLowerCase(),
      _id: { $ne: userId },
    });
    if (emailInUse) {
      return res
        .status(409)
        .json({ message: "This email is no longer available" });
    }

    user.email = pendingNewEmail.toLowerCase();
    await user.save();

    // 5) Cleanup Redis keys
    await redisClient.del(`changeEmail:${userId}`);
    await redisClient.del(`changeEmail:newEmail:${userId}`);

    // 6) Return success
    return res.status(200).json({
      message: "Email updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("verifyEmailChange error:", error);
    return res.status(500).json({
      message: "Failed to verify email change",
      error: error.message,
    });
  }
}

}


// Export a single instance
module.exports = new UserController();