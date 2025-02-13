require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./backend/db');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./backend/auth');
const worldRoutes = require('./backend/worldContext');
const characterRoutes = require('./backend/characters');
const relationshipRoutes = require('./backend/relationships');
const scriptsRouter = require('./backend/scripts');
const aiAssistanceRouter = require('./backend/aiAssistance');
const subscriptionsRouter = require('./backend/subscriptions');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/world', worldRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/scripts', scriptsRouter);
app.use('/api/ai', aiAssistanceRouter);
app.use('/api/subscriptions', subscriptionsRouter);

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message
    });
});

// Test route to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Initialize collaboration module with io instance only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    require('./backend/collaboration')(io);
}

const PORT = process.env.PORT || 3002;

if (process.env.NODE_ENV !== 'test') {
    connectDB().then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }).catch(err => {
        console.error('Database connection failed:', err);
    });
}

// Export app and server for testing
module.exports = { app, server };
