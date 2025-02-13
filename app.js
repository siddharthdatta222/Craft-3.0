require('dotenv').config();
const validateEnv = require('./config/validateEnv');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./backend/db');
const cors = require('cors');
const net = require('net');

// Import routes
const worldRouter = require('./backend/worldContext');
const scriptRouter = require('./backend/routes/scripts');
const characterRouter = require('./backend/routes/characters');
const relationshipRouter = require('./backend/routes/relationships');

// Validate environment variables before starting the app
validateEnv();

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware - log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Mount routes without auth
app.use('/api/world', worldRouter);
app.use('/api/scripts', scriptRouter);
app.use('/api/characters', characterRouter);
app.use('/api/relationships', relationshipRouter);

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// Also add CORS headers directly for debugging
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Function to check if a port is in use
const isPortInUse = (port) => {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once('error', () => resolve(true))
            .once('listening', () => {
                tester.once('close', () => resolve(false));
                tester.close();
            })
            .listen(port);
    });
};

// Function to find an available port
const findAvailablePort = async (startPort) => {
    let port = startPort;
    while (await isPortInUse(port)) {
        console.log(`Port ${port} is in use, trying next port`);
        port++;
        if (port > startPort + 10) {
            throw new Error('No available ports found in range');
        }
    }
    return port;
};

// Function to start server
const startServer = async () => {
    try {
        await connectDB();
        
        const desiredPort = process.env.PORT || 3002;
        const availablePort = await findAvailablePort(desiredPort);
        
        server.listen(availablePort, () => {
            console.log(`Server running on http://localhost:${availablePort}`);
            // If we're using a different port than desired, log a warning
            if (availablePort !== desiredPort) {
                console.log(`Note: Using port ${availablePort} instead of ${desiredPort}`);
            }
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    startServer().catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

module.exports = { app, server };
