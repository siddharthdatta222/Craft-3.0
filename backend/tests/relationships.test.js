const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { app } = require('../../app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testSetup');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Relationships API', () => {
    let authToken;
    let userId;
    let testRelationshipId;

    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
    };

    const testRelationship = {
        character1Id: 'char1',
        character2Id: 'char2',
        type: 'friends',
        description: 'Close childhood friends'
    };

    before(async () => {
        await setupTestDB();
    });

    beforeEach(async () => {
        // Register and login test user
        await chai.request(app)
            .post('/api/auth/register')
            .send(testUser);

        const loginRes = await chai.request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        authToken = loginRes.body.token;
        userId = loginRes.body.userId;
    });

    afterEach(async () => {
        await clearTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    describe('GET /api/relationships', () => {
        beforeEach(async () => {
            // Create a test relationship
            const res = await chai.request(app)
                .post('/api/relationships')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testRelationship);

            testRelationshipId = res.body.id;
        });

        it('should return all relationships', async () => {
            const res = await chai.request(app)
                .get('/api/relationships')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(1);
            expect(res.body[0]).to.have.property('character1Id', testRelationship.character1Id);
            expect(res.body[0]).to.have.property('character2Id', testRelationship.character2Id);
        });

        it('should not return relationships without authentication', async () => {
            const res = await chai.request(app)
                .get('/api/relationships');

            expect(res).to.have.status(401);
        });
    });

    describe('POST /api/relationships', () => {
        it('should create a new relationship with valid data', async () => {
            const res = await chai.request(app)
                .post('/api/relationships')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testRelationship);

            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('character1Id', testRelationship.character1Id);
            expect(res.body).to.have.property('character2Id', testRelationship.character2Id);
            expect(res.body).to.have.property('type', testRelationship.type);
            expect(res.body).to.have.property('description', testRelationship.description);
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('userId');

            testRelationshipId = res.body.id;
        });

        it('should not create relationship with same character IDs', async () => {
            const invalidRelationship = {
                character1Id: 'char1',
                character2Id: 'char1',
                type: 'self',
                description: 'Invalid relationship'
            };

            const res = await chai.request(app)
                .post('/api/relationships')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidRelationship);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error', 'Character IDs must be different.');
        });

        it('should not create relationship without required fields', async () => {
            const invalidRelationship = {
                character1Id: 'char1',
                type: 'friends'
            };

            const res = await chai.request(app)
                .post('/api/relationships')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidRelationship);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error', 'Please provide both character IDs.');
        });
    });

    describe('PUT /api/relationships/:id', () => {
        beforeEach(async () => {
            const res = await chai.request(app)
                .post('/api/relationships')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testRelationship);

            testRelationshipId = res.body.id;
        });

        it('should update an existing relationship', async () => {
            const updates = {
                type: 'enemies',
                description: 'Former friends turned rivals'
            };

            const res = await chai.request(app)
                .put(`/api/relationships/${testRelationshipId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updates);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('type', updates.type);
            expect(res.body).to.have.property('description', updates.description);
        });

        it('should not update non-existent relationship', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await chai.request(app)
                .put(`/api/relationships/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ type: 'updated' });

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('error', 'Relationship not found.');
        });
    });

    describe('DELETE /api/relationships/:id', () => {
        beforeEach(async () => {
            const res = await chai.request(app)
                .post('/api/relationships')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testRelationship);

            testRelationshipId = res.body.id;
        });

        it('should delete an existing relationship', async () => {
            const res = await chai.request(app)
                .delete(`/api/relationships/${testRelationshipId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'Relationship deleted successfully.');
        });

        it('should not delete non-existent relationship', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await chai.request(app)
                .delete(`/api/relationships/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('error', 'Relationship not found.');
        });
    });
}); 