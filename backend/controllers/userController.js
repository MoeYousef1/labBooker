// controllers/userController.js

const User = require("../models/User");
const bcrypt = require("bcrypt");

// Fetch all users (example)
async function fetchUsers(req, res) {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed fetching users: " + error.message });
  }
}

// Get total user count
async function getUserCount(req, res) {
  try {
    const count = await User.countDocuments({});
    return res.status(200).json({ userCount: count });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed fetching user count: " + error.message });
  }
}

module.exports = {
  fetchUsers,
  getUserCount,
};
