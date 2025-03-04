// auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Debug route (remove in production)
router.get("/debug-verification/:email", authController.debugVerification);

// Auth routes
router.post("/signup", authController.signup);
router.post("/verify-signup", authController.verifySignup); // Fixed this line
router.post("/login", authController.login);
router.post("/verify-login", authController.verifyLoginCode);
router.post("/request-code", authController.requestCode);

// Token management
router.post("/refresh-token", authMiddleware.refreshTokens);
router.post("/logout", authMiddleware.requireAuth, authMiddleware.logout);

module.exports = router;
