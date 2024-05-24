const router = require('express').Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

//user registration
router.post('/register', async (req, res) => {
    try {
        // check if already exist
        const userExist = await User.findOne({ email: req.body.email})
        if (userExist) {
            return res.status(200).send({
                message: 'User already exist',
                success: false
            })
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        // create user
        const newUser = new User(req.body);
        await newUser.save();
        res.send({
            message: 'User created successfully',
            success: true
        })

    } catch (error) {
        res.status(500).send({
            message: error.message,
            data: error, 
            success: false
        })
    }

})

//user login
router.post('/login', async (req, res) => {
    try {
        // check if user exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
        return res
            .status(200)
            .send({ message: "User does not exist", success: false });
        }

        //check password
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword) {
        return res
            .status(200)
            .send({ message: "Invalid password", success: false });
        }
        // create token
        const token = jwt.sign({
            userId: user._id,
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
        );

        res.send({
            message: 'Login successful',
            success: true,
            data: token
        })
    } catch (error) {
        res.status(500).send({
            message: error.message,
            data: error, 
            success: false
        })
    }
})

//get user info with token
router.post('/get-user-info', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        res.send({
            message: 'User info retrieved successfully',
            success: true,
            data: user
        })
    } catch (error) {
        send.status(500).send({
            message: error.message,
            data: error,
            success: false
        })
    }
})

module.exports = router;
