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
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Add user info to request
        req.user = {
            _id: new mongoose.Types.ObjectId(decoded.userId),
            userId: decoded.userId
        };
        
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = verifyToken; 