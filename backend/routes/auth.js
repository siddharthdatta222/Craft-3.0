const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request received:', {
            ...req.body,
            password: '[HIDDEN]'
        });

        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (user) {
            return res.status(400).json({
                error: 'User already exists with this email or username'
            });
        }

        // Create new user
        user = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password
        });

        // Save user to database
        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('User registered successfully:', user._id);

        // Return success response
        res.status(201).json({
            token,
            username: user.username
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Server error during registration'
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 