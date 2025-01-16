// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");

// Example of protected routes (requires valid token)
router.get("/users", verifyToken, userController.fetchUsers);


// router.get("/users/count", verifyToken, userController.getUserCount);
router.get("/users/count", userController.getUserCount);


module.exports = router;
