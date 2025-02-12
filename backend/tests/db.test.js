const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const connectDB = require('../db');

describe('Database Connection', () => {
    let mongoServer;
    let originalMongoURI;

    before(async () => {
        originalMongoURI = process.env.MONGODB_URI;
        mongoServer = await MongoMemoryServer.create();
    });

    after(async () => {
        process.env.MONGODB_URI = originalMongoURI;
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    beforeEach(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    it('should connect to MongoDB with valid URI', async () => {
        const mongoUri = await mongoServer.getUri();
        process.env.MONGODB_URI = mongoUri;

        await connectDB();
        expect(mongoose.connection.readyState).to.equal(1);
    });

    it('should use default URI if MONGODB_URI is not set', async () => {
        delete process.env.MONGODB_URI;
        const mongoUri = await mongoServer.getUri();
        process.env.MONGODB_URI = mongoUri;

        await connectDB();
        expect(mongoose.connection.readyState).to.equal(1);
    });

    it('should handle connection errors gracefully', async function() {
        // Set a shorter timeout for this specific test
        this.timeout(5000);

        // Set connection timeout options
        const mongoUri = 'mongodb://non-existent-host:27017/test';
        process.env.MONGODB_URI = mongoUri;

        try {
            // Set a short server selection timeout
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 1000,
                connectTimeoutMS: 1000,
            });
            expect.fail('Should have thrown an error');
        } catch (error) {
            expect(error).to.exist;
            expect(mongoose.connection.readyState).to.not.equal(1);
        }
    });
}); 