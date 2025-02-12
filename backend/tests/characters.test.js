const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../../app');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testSetup');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Characters API', () => {
    let authToken;
    let testCharacterId;

    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
    };

    const testCharacter = {
        name: 'John Doe',
        likes: ['Reading', 'Coffee'],
        dislikes: ['Noise', 'Mornings'],
        background: 'A mysterious character with a hidden past',
        reactions: {
            happy: 'Smiles warmly',
            angry: 'Furrows brow and clenches fists'
        }
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

    describe('GET /api/characters', () => {
        beforeEach(async () => {
            // Create a test character
            const res = await chai.request(app)
                .post('/api/characters')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testCharacter);
            testCharacterId = res.body._id;
        });

        it('should return all characters', (done) => {
            chai.request(app)
                .get('/api/characters')
                .set('Authorization', `Bearer ${authToken}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.equal(1);
                    expect(res.body[0]).to.have.property('name', testCharacter.name);
                    done();
                });
        });

        it('should not return characters without authentication', (done) => {
            chai.request(app)
                .get('/api/characters')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });
    });

    describe('POST /api/characters', () => {
        it('should create a new character with valid data', (done) => {
            chai.request(app)
                .post('/api/characters')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testCharacter)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('name', testCharacter.name);
                    expect(res.body.likes).to.deep.equal(testCharacter.likes);
                    expect(res.body.dislikes).to.deep.equal(testCharacter.dislikes);
                    expect(res.body).to.have.property('background', testCharacter.background);
                    expect(res.body.reactions).to.deep.equal(testCharacter.reactions);
                    expect(res.body).to.have.property('_id');
                    testCharacterId = res.body._id;
                    done();
                });
        });

        it('should not create character without name', (done) => {
            const invalidCharacter = { ...testCharacter };
            delete invalidCharacter.name;

            chai.request(app)
                .post('/api/characters')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidCharacter)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', "Please provide the character's name.");
                    done();
                });
        });

        it('should not create character without authentication', (done) => {
            chai.request(app)
                .post('/api/characters')
                .send(testCharacter)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });
    });

    describe('PUT /api/characters/:id', () => {
        beforeEach(async () => {
            // Create a test character
            const res = await chai.request(app)
                .post('/api/characters')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testCharacter);
            testCharacterId = res.body._id;
        });

        it('should update an existing character', (done) => {
            const updates = {
                name: 'Jane Doe',
                background: 'Updated background story'
            };

            chai.request(app)
                .put(`/api/characters/${testCharacterId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updates)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('name', updates.name);
                    expect(res.body).to.have.property('background', updates.background);
                    expect(res.body.likes).to.deep.equal(testCharacter.likes);
                    done();
                });
        });

        it('should return 404 for non-existent character', (done) => {
            chai.request(app)
                .put('/api/characters/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Updated Name' })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('error', 'Character not found.');
                    done();
                });
        });

        it('should not update character without authentication', (done) => {
            chai.request(app)
                .put(`/api/characters/${testCharacterId}`)
                .send({ name: 'Updated Name' })
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });
    });

    describe('DELETE /api/characters/:id', () => {
        beforeEach(async () => {
            // Create a test character
            const res = await chai.request(app)
                .post('/api/characters')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testCharacter);
            testCharacterId = res.body._id;
        });

        it('should delete an existing character', (done) => {
            chai.request(app)
                .delete(`/api/characters/${testCharacterId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message', 'Character deleted successfully.');
                    done();
                });
        });

        it('should return 404 for non-existent character', (done) => {
            chai.request(app)
                .delete('/api/characters/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${authToken}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('error', 'Character not found.');
                    done();
                });
        });

        it('should not delete character without authentication', (done) => {
            chai.request(app)
                .delete(`/api/characters/${testCharacterId}`)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
                    done();
                });
        });
    });
}); 