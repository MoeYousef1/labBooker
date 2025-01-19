const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Login route
router.post('/login', userController.login);

// Refresh token route
router.post('/refresh-token', authMiddleware.refreshTokens);

// Logout route (requires authentication)
router.post('/logout', 
  authMiddleware.requireAuth, 
  authMiddleware.logout
);

module.exports = router;