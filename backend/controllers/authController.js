const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const secretKey = process.env.JWT_SECRET;

  const token = jwt.sign(payload, secretKey, { expiresIn: "15m" });

  return token;
};

// Generating refresh token
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const secretKey = process.env.JWT_SECRET;

  const refreshToken = jwt.sign(payload, secretKey, { expiresIn: "1d" });

  return refreshToken;
};

// Refreshing access token
const refreshAccessToken = (refreshToken) => {
  try {
    const secretKey = process.env.JWT_SECRET;
    const decoded = jwt.verify(refreshToken, secretKey);

    // Generate a new access token
    return generateToken(decoded);
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

// Signup controller
async function signupRegister(req) {
  const { username, email, password } = req;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { status: 409, message: "This e-mail is already in use!" };
    }
    const isValid = validatePassword(password);
    if(isValid!== 'Valid') {
      return {status:400 , message: "Password is invalid "};
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    return { message: "User Created successfully." };
  } catch (error) {
    throw new Error("Error Creating User!");
  }
}

// Login controller
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

    const username = user.username;
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);


    return {
      status: 200,message: "Login successful!",token,refreshToken,username,
    };
  } catch (error) {
    return { status: 500, message: "Internal Server Error: " + error.message };
  }
}

function validatePassword(password) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password); // At least one uppercase letter
  const hasLowercase = /[a-z]/.test(password); // At least one lowercase letter
  const hasNumber = /\d/.test(password);       // At least one number
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // At least one special character

  if (password.length < minLength) {
      return "Password must be at least 8 characters long.";
  }
  if (!hasUppercase) {
      return "Password must include at least one uppercase letter.";
  }
  if (!hasLowercase) {
      return "Password must include at least one lowercase letter.";
  }
  if (!hasNumber) {
      return "Password must include at least one number.";
  }
  if (!hasSpecialChar) {
      return "Password must include at least one special character.";
  }

  return "Valid";
}

module.exports = {
  signupRegister,
  loginRegister,
  refreshAccessToken,
};
