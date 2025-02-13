const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const router = express.Router();
const { User } = require('./models');

// JWT secret (in production, this should be in environment variables)
const JWT_SECRET = 'your_jwt_secret';
const SALT_ROUNDS = 10;

// Add this before your routes
router.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

// Add this test route to verify routing is working
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working' });
});

// Debug middleware - log all requests
router.use((req, res, next) => {
    console.log('Auth Route:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    next();
});

// User registration endpoint
router.post('/register', async (req, res) => {
    try {
        console.log('Register endpoint hit');
        console.log('Request body:', req.body);

        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            console.log('Missing fields:', { username: !username, email: !email, password: !password });
            return res.status(400).json({
                status: 'error',
                message: 'Please provide username, email, and password'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already registered'
            });
        }

        // Create user
        const user = new User({
            username,
            email,
            password: await bcrypt.hash(password, 10)
        });

        await user.save();
        console.log('User saved successfully:', user._id);

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        // Send response
        return res.status(201).json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// User login endpoint
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt:', req.body.email); // Debug log

        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful:', email); // Debug log

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error); // Debug log
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!'
    });
});

module.exports = router; 