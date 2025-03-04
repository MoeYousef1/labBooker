// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Authentication routes
router.post("/send-code", userController.sendVerificationCode);
router.post("/verify", userController.verifyCodeAndLogin);
router.post("/resend-code", userController.resendVerificationCode);

// Protected routes
router.get("/users", authMiddleware.requireAuth, userController.fetchUsers);

router.get("/count", authMiddleware.requireAuth, userController.getUserCount);

router.get(
  "/profile",
  authMiddleware.requireAuth,
  userController.getUserProfile,
);

router.put(
  "/profile",
  authMiddleware.requireAuth,
  userController.updateUserProfile,
);

// routes/userRoutes.js
router.post(
  "/check-email",
  authMiddleware.requireAuth,
  userController.checkEmailAvailability,
);

router.post(
  "/initiate-email-change",
  authMiddleware.requireAuth,
  userController.initiateEmailChange,
);

router.post(
  "/verify-email-change",
  authMiddleware.requireAuth,
  userController.verifyEmailChange,
);

router.post(
  "/cancel-email-change",
  authMiddleware.requireAuth,
  userController.cancelEmailChange,
);

// Admin routes
router.get(
  "/admin/users",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("admin"),
  userController.getAllUsers,
);

router.patch(
  "/admin/users/:userId/role",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("admin"),
  userController.updateUserRole,
);

router.patch(
  "/admin/users/:userId/block",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("admin"),
  userController.blockUser,
);

router.patch(
  "/admin/users/:userId/unblock",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("admin"),
  userController.unblockUser,
);

router.delete(
  "/admin/users/:userId",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("admin"),
  userController.deleteUser,
);

// Export router
module.exports = router;
