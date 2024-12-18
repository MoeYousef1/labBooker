const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); 
const userController = require('../controllers/userController');

router.put('/setting',async (req,res)=> {
    const {userID,currentPassword,newPassword} = await userController.changePassword(req.body);
    if(!userID || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'All fields are required.'});
    }
    try { 
    const user = await User.findOne({userID});
    if(!userID) {
        return res.status(400).json({error:"user not found!"});
    }
    const isMatch = await bcrypt.compare(currentPassword,user.password);
    if(!isMatch) {
        return res.status(400).json({error:"incorrect Password, try again!"});
    }
    const hashedPassword = await bcrypt.hash(newPassword,10);
    
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully.' });

    
    }
    catch(error) {

        res.status(500).json({ error: 'Server error. Please try again later.' });

    }

});

module.exports = router;
