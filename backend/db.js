const mongoose = require('mongoose');

// Connection function
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost/scriptwriting-app';
        
        const options = {
            serverSelectionTimeoutMS: process.env.NODE_ENV === 'test' ? 1000 : 30000,
            connectTimeoutMS: process.env.NODE_ENV === 'test' ? 1000 : 30000,
        };

        const connection = await mongoose.connect(uri, options);
        
        console.log('MongoDB connected successfully');
        return connection;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
};

module.exports = connectDB; 