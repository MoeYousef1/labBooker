const express = require("express");
const router = express.Router();
const  settingsController = require("../controllers/settingsController");

router.put("/change-password", async (req, res) => {
  try {
    const response = await settingsController.changePassword(req.body);

    if (response.status === 400) {
      return res.status(400).json({ message: response.message });
    }

    if (response.status === 200) {
      return res.status(200).json({ message: response.message });
    }

    res.status(500).json({ message: "Unexpected error" });
  } catch (error) {
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

router.put("/forgot-password", async (req,res) => {
  try {
    const response = await settingsController.forgotPassword(req.body);
    
  }
  catch(error) {

  }
});


module.exports = router;
