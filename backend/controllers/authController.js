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

async function loginRegister(userData) {
  try {
    const { email, password } = userData;

    const user = await User.findOne({ email });
    if (!user) {
      return { status: 404, message: "User does not exist!" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { status: 401, message: "Incorrect password!" };
    }

    return { status: 200, message: "Login successful!" };
  } catch (error) {
    return { status: 500, message: "Internal Server Error: " + error.message };
  }
}

module.exports = { 
    
  signupRegister,
  loginRegister
  
};
