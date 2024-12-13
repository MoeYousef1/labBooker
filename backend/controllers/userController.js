const User = require('./models/User');
const bcrypt = require("bcrypt");

async function fetchUsers(req) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    throw  new Error('Failed fetiching users!' + error);
  }
}

module.exports = { 
  fetchUsers
};
