const express = require("express");
const router = express.Router();
const { requestCode, verifyCode } = require("../controllers/authController"); // Ensure correct path and function names

// POST request for requesting code
router.post("/request-code", requestCode);

// POST request for verifying code
router.post("/verify-code", verifyCode);

module.exports = router;
