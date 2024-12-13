const express = require("express");
const User = require("../models/User"); 
const router = express.Router();
const authController = require("../controllers/authController");
const bcrypt = require("bcrypt");

// Sign-up Route
router.post("/signup", async (req, res) => {
  try {
    const response = await authController.signupRegister(req.body);
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: "Error Creating User: " + error });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body; 

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User Not Found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password, try again!" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Unable to login: " + error.message });
  }
});


// Fetch all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed fetching users: " + error.message });
  }
});

module.exports = router;
