require('dotenv').config();

const jwt = require('jsonwebtoken');

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
