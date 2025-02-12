const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../../app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testSetup');
const expect = chai.expect;

chai.use(chaiHttp);

describe('AI Assistance API', () => {
    let authToken;
    
    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
    };

    before(async () => {
        await setupTestDB();
        
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
    });

    afterEach(async () => {
        await clearTestDB();
    });

    after(async () => {
        await teardownTestDB();
    });

    describe('POST /api/ai/generate-character', () => {
        it('should generate a character based on description', (done) => {
            const prompt = {
                description: 'A wise old mentor figure with a mysterious past'
            };

            chai.request(app)
                .post('/api/ai/generate-character')
                .set('Authorization', `Bearer ${authToken}`)
                .send(prompt)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('name');
                    expect(res.body).to.have.property('background');
                    expect(res.body).to.have.property('likes');
                    expect(res.body).to.have.property('dislikes');
                    expect(res.body).to.have.property('reactions');
                    done();
                });
        });

        it('should not generate character without description', (done) => {
            chai.request(app)
                .post('/api/ai/generate-character')
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide a character description.');
                    done();
                });
        });

        it('should not generate character without authentication', (done) => {
            const prompt = {
                description: 'A wise old mentor figure'
            };

            chai.request(app)
                .post('/api/ai/generate-character')
                .send(prompt)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });
    });

    describe('POST /api/ai/generate-dialogue', () => {
        it('should generate dialogue based on context', (done) => {
            const prompt = {
                characters: ['John', 'Sarah'],
                context: 'A tense conversation about a betrayal',
                tone: 'dramatic'
            };

            chai.request(app)
                .post('/api/ai/generate-dialogue')
                .set('Authorization', `Bearer ${authToken}`)
                .send(prompt)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('dialogue');
                    expect(res.body.dialogue).to.be.a('string');
                    done();
                });
        });

        it('should not generate dialogue without required fields', (done) => {
            const prompt = {
                characters: ['John']
                // missing context and tone
            };

            chai.request(app)
                .post('/api/ai/generate-dialogue')
                .set('Authorization', `Bearer ${authToken}`)
                .send(prompt)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide characters, context, and tone.');
                    done();
                });
        });

        it('should not generate dialogue without authentication', (done) => {
            const prompt = {
                characters: ['John', 'Sarah'],
                context: 'A casual conversation',
                tone: 'friendly'
            };

            chai.request(app)
                .post('/api/ai/generate-dialogue')
                .send(prompt)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });
    });

    describe('POST /api/ai/enhance-description', () => {
        it('should enhance a scene description', (done) => {
            const prompt = {
                description: 'A dark alley at night',
                style: 'noir'
            };

            chai.request(app)
                .post('/api/ai/enhance-description')
                .set('Authorization', `Bearer ${authToken}`)
                .send(prompt)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('enhancedDescription');
                    expect(res.body.enhancedDescription).to.be.a('string');
                    done();
                });
        });

        it('should not enhance description without required fields', (done) => {
            const prompt = {
                // missing description and style
            };

            chai.request(app)
                .post('/api/ai/enhance-description')
                .set('Authorization', `Bearer ${authToken}`)
                .send(prompt)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Please provide description and style.');
                    done();
                });
        });

        it('should not enhance description without authentication', (done) => {
            const prompt = {
                description: 'A sunny beach',
                style: 'romantic'
            };

            chai.request(app)
                .post('/api/ai/enhance-description')
                .send(prompt)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });
    });
}); 