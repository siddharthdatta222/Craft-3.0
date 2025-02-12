const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../../app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testSetup');
const expect = chai.expect;

// Configure chai
chai.use(chaiHttp);

describe('World Context API', () => {
    let authToken;
    let testNodeId;

    // Sample world context node
    const testNode = {
        title: 'Test World',
        description: 'A test world description',
        rules: 'Test world rules'
    };

    before(async () => {
        await setupTestDB();
        
        // Register and login a test user
        const testUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };

        // Register user
        await chai.request(app)
            .post('/api/auth/register')
            .send(testUser);

        // Login user
        const loginRes = await chai.request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        authToken = loginRes.body.token;
    });

    afterEach(async () => {
        await clearTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    describe('GET /api/world', () => {
        it('should return all world context nodes with 200 status', (done) => {
            chai.request(app)
                .get('/api/world')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });
    });

    describe('POST /api/world', () => {
        it('should create a new world context node with valid data', (done) => {
            chai.request(app)
                .post('/api/world')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testNode)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('title', testNode.title);
                    expect(res.body).to.have.property('description', testNode.description);
                    expect(res.body).to.have.property('rules', testNode.rules);
                    expect(res.body).to.have.property('_id');
                    testNodeId = res.body._id; // Save for later tests
                    done();
                });
        });

        it('should not create node without authentication', (done) => {
            chai.request(app)
                .post('/api/world')
                .send(testNode)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });

        it('should not create node with missing title', (done) => {
            const invalidNode = {
                description: testNode.description,
                rules: testNode.rules
            };

            chai.request(app)
                .post('/api/world')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidNode)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide title, description, and rules.');
                    done();
                });
        });

        it('should not create node with missing description', (done) => {
            const invalidNode = {
                title: testNode.title,
                rules: testNode.rules
            };

            chai.request(app)
                .post('/api/world')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidNode)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide title, description, and rules.');
                    done();
                });
        });

        it('should not create node with missing rules', (done) => {
            const invalidNode = {
                title: testNode.title,
                description: testNode.description
            };

            chai.request(app)
                .post('/api/world')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidNode)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide title, description, and rules.');
                    done();
                });
        });
    });

    describe('PUT /api/world/:id', () => {
        beforeEach(async () => {
            // Create a test node before each PUT test
            const res = await chai.request(app)
                .post('/api/world')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testNode);
            testNodeId = res.body._id;
        });

        it('should update an existing node with valid data', (done) => {
            const updates = {
                title: 'Updated Test World',
                description: 'Updated description'
            };

            chai.request(app)
                .put(`/api/world/${testNodeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updates)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('title', updates.title);
                    expect(res.body).to.have.property('description', updates.description);
                    done();
                });
        });

        it('should return 404 for non-existent node', (done) => {
            chai.request(app)
                .put('/api/world/507f1f77bcf86cd799439011') // Valid MongoDB ObjectId that doesn't exist
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Updated Title' })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('error', 'Node not found.');
                    done();
                });
        });

        it('should not update node without authentication', (done) => {
            chai.request(app)
                .put(`/api/world/${testNodeId}`)
                .send({ title: 'Updated Title' })
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });
    });

    describe('DELETE /api/world/:id', () => {
        beforeEach(async () => {
            // Create a test node before each DELETE test
            const res = await chai.request(app)
                .post('/api/world')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testNode);
            testNodeId = res.body._id;
        });

        it('should delete an existing node', (done) => {
            chai.request(app)
                .delete(`/api/world/${testNodeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message', 'Node deleted successfully.');
                    done();
                });
        });

        it('should return 404 for non-existent node', (done) => {
            chai.request(app)
                .delete('/api/world/507f1f77bcf86cd799439011') // Valid MongoDB ObjectId that doesn't exist
                .set('Authorization', `Bearer ${authToken}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('error', 'Node not found.');
                    done();
                });
        });

        it('should not delete node without authentication', (done) => {
            chai.request(app)
                .delete(`/api/world/${testNodeId}`)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });
    });
}); 