const User = require("../models/User");
const bcrypt = require("bcrypt");
const authMiddleware = require('../middleware/authMiddleware');
const RedisClient = require('../utils/redisClient');

class UserController {
  // Fetch all users (protected route)
  async fetchUsers(req, res) {
    try {
      // Optional: Add pagination and filtering
      const { 
        page = 1, 
        limit = 10, 
        search = '' 
      } = req.query;

      // Build query
      const query = search 
        ? { 
            $or: [
              { username: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ] 
          } 
        : {};

      // Fetch users with pagination
      const users = await User.find(query)
        .select('-password') // Exclude password
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      // Count total users
      const total = await User.countDocuments(query);

      return res.status(200).json({
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalUsers: total
      });
    } catch (error) {
      console.error('Fetch users error:', error);
      return res.status(500).json({ 
        message: "Failed fetching users", 
        error: error.message 
      });
    }
  }

  // Get total user count
  async getUserCount(req, res) {
    try {
      const count = await User.countDocuments({});
      return res.status(200).json({ userCount: count });
    } catch (error) {
      console.error('Get user count error:', error);
      return res.status(500).json({ 
        message: "Failed fetching user count", 
        error: error.message 
      });
    }
  }

  // User registration
  async register(req, res) {
    try {
      const { username, email, password, role = 'user' } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ 
          message: "All fields are required" 
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (existingUser) {
        return res.status(409).json({ 
          message: "User already exists",
          field: existingUser.email === email ? 'email' : 'username'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role
      });

      await newUser.save();

      // Remove sensitive information
      const userResponse = newUser.toObject();
      delete userResponse.password;

      return res.status(201).json({
        message: "User registered successfully",
        user: userResponse
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ 
        message: "Registration failed", 
        error: error.message 
      });
    }
  }

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          message: "Email and password are required" 
        });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid credentials" 
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          message: "Invalid credentials" 
        });
      }

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
      console.error('Login error:', error);
      return res.status(500).json({ 
        message: "Login failed", 
        error: error.message 
      });
    }
  }

  // Get user profile
  async getUserProfile(req, res) {
    try {
      // req.user is set by authMiddleware
      const user = await User.findById(req.user._id)
        .select('-password -__v');

      if (!user) {
        return res.status(404).json({ 
          message: "User not found" 
        });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ 
        message: "Failed to retrieve profile", 
        error: error.message 
      });
    }
  }

  // Update user profile
  async updateUserProfile(req, res) {
    try {
      const { username, email } = req.body;

      // Validate input
      if (!username && !email) {
        return res.status(400).json({ 
          message: "At least one field to update is required" 
        });
      }

      // Check for existing users with same username/email
      const existingUser = await User.findOne({
        $or: [
          { username: username },
          { email: email }
        ],
        _id: { $ne: req.user._id } // Exclude current user
      });

      if (existingUser) {
        return res.status(409).json({ 
          message: "Username or email already in use",
          field: existingUser.username === username ? 'username' : 'email'
        });
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id, 
        { 
          ...(username && { username }),
          ...(email && { email }) 
        }, 
        { 
          new: true, 
          runValidators: true 
        }
      ).select('-password');

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

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          message: "Current and new passwords are required" 
        });
      }

      // Find user
      const user = await User.findById(req.user._id);

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          message: "Current password is incorrect" 
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      // Invalidate all existing tokens
      await RedisClient.deleteToken(`refresh:${user._id}`);

      return res.status(200).json({ 
        message: "Password changed successfully" 
      });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(500).json({ 
        message: "Failed to change password", 
        error: error.message 
      });
    }
  }
}

module.exports = new UserController();