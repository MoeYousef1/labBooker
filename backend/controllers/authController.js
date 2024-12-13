const User = require('../models/User');
const bcrypt = require("bcrypt");


async function signupRegister(req) {
  const { username, email, password } = req;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { message: "This e-mail is already in use!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    return { message: "User Created successfully." };
  } catch (error) {
    throw new Error("Error Creating User!" + error);
  }
}

async function loginRegister(req) {
  const { username, email, password } = req;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { message: "This e-mail is already in use!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    return { message: "User Created successfully." };
  } catch (error) {
    throw new Error("Error Creating User!" + error);
  }
}

async function fetchUsers(req) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    throw  new Error('Failed fetiching users!' + error);
  }
}

module.exports = { 
    
  signupRegister,
  fetchUsers,
  loginRegister
  
};
