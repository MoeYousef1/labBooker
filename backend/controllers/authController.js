const User = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

//generating token
const generateToken = (user)=> {
    const payload = { 
        id:user._id,
        email:user.email,
        role:user.role,
    };

    const secretKey = process.env.JWT_SECRET;

    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

    return token;
}


//signup controller
async function signupRegister(req) {
  const { username, email, password } = req;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { status:409,message: "This e-mail is already in use!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    return { message: "User Created successfully." };
  } catch (error) {
    throw new Error("Error Creating User!");
  }
}

//login controller 
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
    const token = generateToken(userData); //Might be "User" insted of "userData"
    return { status: 200, message: "Login successful!" ,token};
  } catch (error) {
    return { status: 500, message: "Internal Server Error: " + error.message };
  }
}



module.exports = { 
    
  signupRegister,
  loginRegister
  
};
