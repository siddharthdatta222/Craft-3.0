const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../../app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testSetup');
const expect = chai.expect;

// Configure chai
chai.use(chaiHttp);

describe('Authentication API', () => {
    before(async () => {
        await setupTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    // Test user data
    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
    };

    describe('POST /api/auth/register', () => {
        it('should register a new user with valid data', (done) => {
            const user = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            chai.request(app)
                .post('/api/auth/register')
                .send(user)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('message', 'User registered successfully');
                    expect(res.body).to.have.property('userId');
                    expect(res.body).to.not.have.property('password');
                    done();
                });
        });

        it('should not register a user with missing username', (done) => {
            const invalidUser = {
                email: testUser.email,
                password: testUser.password
            };

            chai.request(app)
                .post('/api/auth/register')
                .send(invalidUser)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide username, email, and password.');
                    done();
                });
        });

        it('should not register a user with missing email', (done) => {
            const invalidUser = {
                username: testUser.username,
                password: testUser.password
            };

            chai.request(app)
                .post('/api/auth/register')
                .send(invalidUser)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide username, email, and password.');
                    done();
                });
        });

        it('should not register a user with missing password', (done) => {
            const invalidUser = {
                username: testUser.username,
                email: testUser.email
            };

            chai.request(app)
                .post('/api/auth/register')
                .send(invalidUser)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide username, email, and password.');
                    done();
                });
        });

        it('should not register a user with duplicate email', (done) => {
            // First register a user
            chai.request(app)
                .post('/api/auth/register')
                .send(testUser)
                .end(() => {
                    // Try to register the same user again
                    chai.request(app)
                        .post('/api/auth/register')
                        .send(testUser)
                        .end((err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.have.property('error', 'Email already registered.');
                            done();
                        });
                });
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach((done) => {
            // Register a user before testing login
            chai.request(app)
                .post('/api/auth/register')
                .send(testUser)
                .end(() => done());
        });

        it('should login with valid credentials', (done) => {
            chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message', 'Login successful');
                    expect(res.body).to.have.property('token');
                    expect(res.body.token).to.be.a('string');
                    done();
                });
        });

        it('should not login with invalid email', (done) => {
            chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: testUser.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Invalid email or password.');
                    done();
                });
        });

        it('should not login with invalid password', (done) => {
            chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Invalid email or password.');
                    done();
                });
        });

        it('should not login with missing email', (done) => {
            chai.request(app)
                .post('/api/auth/login')
                .send({
                    password: testUser.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide email and password.');
                    done();
                });
        });

        it('should not login with missing password', (done) => {
            chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide email and password.');
                    done();
                });
        });
    });
}); 