const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Make sure the path is correct

// POST route to request the verification code
router.post('/request-code', authController.requestCode);

// POST route to verify the code
router.post('/verify-code', authController.verifyCode);

module.exports = router;
