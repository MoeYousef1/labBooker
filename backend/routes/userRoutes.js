const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./models/User'); 
const router = express.Router();


//Sign-up Route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'This e-mail is already in use!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    try {
        await newUser.save();
        res.json({ message: 'User Created successfully.' });
    } catch (error) {
        res.status(400).json({ message: 'Error Creating User!' });
    }
});


//Loge-in Route
router.post('/login',async(req,res)=> {
    
    const {email,password} = req.body;

    const user = await User.findone({email});
    if(!user) {
        return res.status(400).json({message:'User Not Found!'});
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch) {
        return res.status(400).json({message:'Incorrect Password, try again!'});
    }
    res.status(200).json({message:'Login successful'});
});

//Fetch all users
router.get('/users',async (req,res)=> {
    try {
        const users = await User.find();
        res.status(200).json(users);
    }
    catch(error) {
        console.error(error);
        res.status(500).json({message:'Failed fetiching users!'});
    }
});

module.exports = router;
