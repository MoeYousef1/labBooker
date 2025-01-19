const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RedisClient = require('../utils/redisClient');

class AuthMiddleware {
  async generateTokens(user) {
    // Access token
    const accessToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_ACCESS_SECRET, 
      { expiresIn: '15m' }
    );

    // Refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token in Redis
    await RedisClient.storeToken(`refresh:${user._id}`, refreshToken, 7 * 24 * 60 * 60);

    return { accessToken, refreshToken };
  }

  async requireAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ 
          message: 'No token provided',
          error: 'Unauthorized' 
        });
      }

      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ 
          message: 'Token format is invalid',
          error: 'Unauthorized'
        });
      }

      const token = parts[1];

      // Check if token is blacklisted
      const isBlacklisted = await RedisClient.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return res.status(401).json({ 
          message: 'Token is no longer valid',
          error: 'Unauthorized' 
        });
      }

      // Verify access token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Find user
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ 
          message: 'User not found',
          error: 'Unauthorized' 
        });
      }

      // Attach user to request object
      req.user = user;
      req.token = token;

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          error: 'Unauthorized' 
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired',
          error: 'Token Expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      console.error('Authentication error:', error);
      return res.status(500).json({ 
        message: 'Authentication failed',
        error: error.message 
      });
    }
  }

  // Refresh token endpoint handler
  async refreshTokens(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ 
          message: 'Refresh token is required',
          error: 'Bad Request' 
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Check if refresh token is stored in Redis
      const storedRefreshToken = await RedisClient.getToken(`refresh:${decoded.userId}`);
      
      if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
        return res.status(401).json({ 
          message: 'Invalid refresh token',
          error: 'Unauthorized' 
        });
      }

      // Find user
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ 
          message: 'User not found',
          error: 'Unauthorized' 
        });
      }

      // Generate new tokens
      const { 
        accessToken: newAccessToken, 
        refreshToken: newRefreshToken 
      } = await this.generateTokens(user);

      // Optional: Invalidate old refresh token
      await RedisClient.deleteToken(`refresh:${user._id}`);

      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(500).json({ 
        message: 'Token refresh failed',
        error: error.message 
      });
    }
  }

  // Logout handler
  async logout(req, res) {
    try {
      // Blacklist current access token
      if (req.token) {
        await RedisClient.blacklistToken(req.token);
      }

      // Remove refresh token from Redis
      if (req.user) {
        await RedisClient.deleteToken(`refresh:${req.user._id}`);
      }

      return res.status(200).json({ 
        message: 'Logged out successfully' 
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ 
        message: 'Logout failed',
        error: error.message 
      });
    }
  }
}

module.exports = new AuthMiddleware();