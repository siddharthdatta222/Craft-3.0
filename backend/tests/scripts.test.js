const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { app } = require('../../app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testSetup');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Scripts API', () => {
    let authToken;
    let userId;
    let testScriptId;

    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
    };

    const testScript = {
        title: 'Test Script',
        content: 'INT. ROOM - DAY\n\nA test scene.',
        genre: 'Drama',
        logline: 'A test logline',
        synopsis: 'A test synopsis'
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

    describe('GET /api/scripts', () => {
        beforeEach(async () => {
            // Create a test script
            const res = await chai.request(app)
                .post('/api/scripts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testScript);

            testScriptId = res.body.id;
        });

        it('should return all scripts for the user', async () => {
            const res = await chai.request(app)
                .get('/api/scripts')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(1);
            expect(res.body[0]).to.have.property('title', testScript.title);
            expect(res.body[0]).to.have.property('content', testScript.content);
        });

        it('should not return scripts without authentication', async () => {
            const res = await chai.request(app)
                .get('/api/scripts');

            expect(res).to.have.status(401);
        });
    });

    describe('GET /api/scripts/:id', () => {
        beforeEach(async () => {
            const res = await chai.request(app)
                .post('/api/scripts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testScript);

            testScriptId = res.body.id;
        });

        it('should return a specific script', async () => {
            const res = await chai.request(app)
                .get(`/api/scripts/${testScriptId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('title', testScript.title);
            expect(res.body).to.have.property('content', testScript.content);
        });

        it('should return 404 for non-existent script', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await chai.request(app)
                .get(`/api/scripts/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res).to.have.status(404);
        });
    });

    describe('POST /api/scripts', () => {
        it('should create a new script with valid data', async () => {
            const res = await chai.request(app)
                .post('/api/scripts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testScript);

            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('title', testScript.title);
            expect(res.body).to.have.property('content', testScript.content);
            expect(res.body).to.have.property('genre', testScript.genre);
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('userId');

            testScriptId = res.body.id;
        });

        it('should not create script without required fields', async () => {
            const invalidScript = {
                genre: 'Drama'
            };

            const res = await chai.request(app)
                .post('/api/scripts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidScript);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error');
        });
    });

    describe('PUT /api/scripts/:id', () => {
        beforeEach(async () => {
            const res = await chai.request(app)
                .post('/api/scripts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testScript);

            testScriptId = res.body.id;
        });

        it('should update an existing script', async () => {
            const updates = {
                title: 'Updated Title',
                content: 'Updated content'
            };

            const res = await chai.request(app)
                .put(`/api/scripts/${testScriptId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updates);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('title', updates.title);
            expect(res.body).to.have.property('content', updates.content);
        });

        it('should not update script of another user', async () => {
            // Register and login another user
            const anotherUser = {
                username: 'anotheruser',
                email: 'another@example.com',
                password: 'password123'
            };

            await chai.request(app)
                .post('/api/auth/register')
                .send(anotherUser);

            const loginRes = await chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: anotherUser.email,
                    password: anotherUser.password
                });

            const anotherUserToken = loginRes.body.token;

            const res = await chai.request(app)
                .put(`/api/scripts/${testScriptId}`)
                .set('Authorization', `Bearer ${anotherUserToken}`)
                .send({ title: 'Unauthorized update' });

            expect(res).to.have.status(404);
        });
    });

    describe('DELETE /api/scripts/:id', () => {
        beforeEach(async () => {
            const res = await chai.request(app)
                .post('/api/scripts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testScript);

            testScriptId = res.body.id;
        });

        it('should delete an existing script', async () => {
            const res = await chai.request(app)
                .delete(`/api/scripts/${testScriptId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message', 'Script deleted successfully.');

            // Verify script is deleted
            const getRes = await chai.request(app)
                .get(`/api/scripts/${testScriptId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(getRes).to.have.status(404);
        });

        it('should not delete script of another user', async () => {
            // Register and login another user
            const anotherUser = {
                username: 'anotheruser',
                email: 'another@example.com',
                password: 'password123'
            };

            await chai.request(app)
                .post('/api/auth/register')
                .send(anotherUser);

            const loginRes = await chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: anotherUser.email,
                    password: anotherUser.password
                });

            const anotherUserToken = loginRes.body.token;

            const res = await chai.request(app)
                .delete(`/api/scripts/${testScriptId}`)
                .set('Authorization', `Bearer ${anotherUserToken}`);

            expect(res).to.have.status(404);
        });
    });
}); 