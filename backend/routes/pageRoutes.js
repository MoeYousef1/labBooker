// routes/pageRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Correct path
const { getPage, updatePage } = require('../controllers/pageController');

// Public access to read pages
router.get('/:slug', getPage);

// Admin-only access for updates
router.put('/:slug', 
  authMiddleware.requireAuth, // Use class method
  authMiddleware.requireRole(['admin']), // Pass array of allowed roles
  updatePage
);

module.exports = router;