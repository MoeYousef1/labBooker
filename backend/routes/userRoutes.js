const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get("/users", 
  authMiddleware.requireAuth, 
  userController.fetchUsers
);

router.get("/users/count", 
  // authMiddleware.requireAuth, 
  userController.getUserCount
);

router.get("/profile", 
  authMiddleware.requireAuth, 
  userController.getUserProfile
);

router.put("/profile", 
  authMiddleware.requireAuth, 
  userController.updateUserProfile
);

router.post("/change-password", 
  authMiddleware.requireAuth, 
  userController.changePassword
);

module.exports = router;