// auth.routes.js
const express = require("express");
const router = express.Router();
const { 
  signup, 
  verifySignup,
  requestCode, 
  verifyCode 
} = require("../controllers/authController");

// Signup routes
router.post("/signup", signup);
router.post("/verify-signup", verifySignup);

// Existing routes
router.post("/request-code", requestCode);
router.post("/verify-code", verifyCode);

module.exports = router;