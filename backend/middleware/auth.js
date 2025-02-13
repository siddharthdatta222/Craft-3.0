const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// JWT secret (should match the one in auth.js)
const JWT_SECRET = 'your_jwt_secret';

// Middleware to verify JWT tokens
const verifyToken = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

const auth = (req, res, next) => {
    // Bypass authentication temporarily
    req.user = { id: 'dummy-user-id' }; // Add a dummy user ID
    next();
};

module.exports = auth; 