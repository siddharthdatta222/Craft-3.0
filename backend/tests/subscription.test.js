const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../../app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testSetup');
const expect = chai.expect;
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

describe('Subscription API', () => {
    let authToken;
    let userId;
    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
    };

    before(async () => {
        await setupTestDB();
        
        // Register user
        const registerRes = await chai.request(app)
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
        
        // Decode the JWT token to get the user ID and convert to string
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        userId = String(decoded.userId); // Convert to string
    });

    afterEach(async () => {
        await clearTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    describe('GET /api/subscriptions/plans', () => {
        it('should return all subscription plans', (done) => {
            chai.request(app)
                .get('/api/subscriptions/plans')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.greaterThan(0);
                    expect(res.body[0]).to.have.all.keys('planId', 'name', 'price', 'features');
                    done();
                });
        });
    });

    describe('POST /api/subscriptions/subscribe', () => {
        it('should create a new subscription with valid data', (done) => {
            chai.request(app)
                .post('/api/subscriptions/subscribe')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    userId: userId,
                    planId: 'basic'
                })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(String(res.body.userId)).to.equal(userId); // Convert to string for comparison
                    expect(res.body).to.have.property('planId', 'basic');
                    expect(res.body).to.have.property('status', 'active');
                    done();
                });
        });

        it('should not create subscription without authentication', (done) => {
            chai.request(app)
                .post('/api/subscriptions/subscribe')
                .send({
                    userId: userId,
                    planId: 'basic'
                })
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });

        it('should not create subscription with invalid plan ID', (done) => {
            chai.request(app)
                .post('/api/subscriptions/subscribe')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    userId: userId,
                    planId: 'nonexistent'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Invalid plan ID.');
                    done();
                });
        });

        it('should not create subscription without user ID', (done) => {
            chai.request(app)
                .post('/api/subscriptions/subscribe')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    planId: 'basic'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide userId and planId.');
                    done();
                });
        });
    });

    describe('GET /api/subscriptions/user/:userId', () => {
        beforeEach(async () => {
            // Create a subscription for the test user
            await chai.request(app)
                .post('/api/subscriptions/subscribe')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    userId: userId,
                    planId: 'basic'
                });
        });

        it('should return user subscription details', (done) => {
            chai.request(app)
                .get(`/api/subscriptions/user/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(String(res.body.userId)).to.equal(userId); // Convert to string for comparison
                    expect(res.body).to.have.property('planId', 'basic');
                    expect(res.body).to.have.property('status', 'active');
                    expect(res.body).to.have.property('plan');
                    expect(res.body.plan).to.have.property('name');
                    expect(res.body.plan).to.have.property('price');
                    done();
                });
        });

        it('should not return subscription without authentication', (done) => {
            chai.request(app)
                .get(`/api/subscriptions/user/${userId}`)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });

        it('should return 404 for non-existent user subscription', (done) => {
            chai.request(app)
                .get('/api/subscriptions/user/nonexistentuser')
                .set('Authorization', `Bearer ${authToken}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('error', 'Subscription not found for user.');
                    done();
                });
        });
    });
}); 