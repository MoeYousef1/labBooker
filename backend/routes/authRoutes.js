const express = require("express");
// const User = require("../models/User"); 
const router = express.Router();
const authController = require("../controllers/authController");
// const bcrypt = require("bcrypt");


// Sign-up Route
router.post("/signup", async (req, res) => {
  try {
    const response = await authController.signupRegister(req.body);
    if(response.message.includes("This e-mail is already in use!")) {
      return res.status(409).json({message:response.message})
    }
    if(response.message.includes("Password is invalid ")) {
      return res.status(400).json({message:response.message});
    }
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error Creating User: " + error });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const response = await authController.loginRegister(req.body);

    // Check response and set appropriate status codes
    if (response.message.includes("User does not exist")) {
      return res.status(404).json({ message: response.message });
    }

    if (response.message.includes("Incorrect password")) {
      return res.status(401).json({ message: response.message });
    }

    // If everything is successful, send status 200
    res.status(200).json( response );
  } catch (error) {
    res.status(500).json({ message: "Unable to login: " + error.message });
  }
});



module.exports = router;

