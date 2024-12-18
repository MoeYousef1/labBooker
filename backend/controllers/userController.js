const User = require("../models/User");
const bcrypt = require("bcrypt");
async function fetchUsers(req, res) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed fetching users: " + error.message });
  }
}


module.exports = {
  fetchUsers,
};
