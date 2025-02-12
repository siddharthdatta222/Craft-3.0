const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup function to be called before tests
async function setupTestDB() {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
}

// Cleanup function to be called after each test
async function clearTestDB() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
}

// Teardown function to be called after all tests
async function teardownTestDB() {
    await mongoose.disconnect();
    await mongoServer.stop();
}

module.exports = {
    setupTestDB,
    clearTestDB,
    teardownTestDB
}; 