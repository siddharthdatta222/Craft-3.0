const chai = require('chai');
const { expect } = chai;
const io = require('socket.io-client');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./testSetup');
const { app } = require('../../app');
const http = require('http');

describe('Collaboration WebSocket API', function() {
    // Increase timeout for all tests in this suite
    this.timeout(5000);

    let server;
    let clientSocket1;
    let clientSocket2;
    let socketServer;
    const PORT = 3001;
    const SOCKET_URL = `http://localhost:${PORT}`;

    before(async function() {
        await setupTestDB();
        server = http.createServer(app);
        socketServer = require('socket.io')(server);
        require('../collaboration')(socketServer);
        server.listen(PORT);
        console.log('Test server started on port', PORT);
    });

    beforeEach(function(done) {
        // Setup connection options
        const options = {
            'force new connection': true,
            transports: ['websocket'],
            reconnection: false,
            timeout: 1000
        };

        // Create two client sockets
        clientSocket1 = io(SOCKET_URL, options);
        clientSocket2 = io(SOCKET_URL, options);

        let connected = 0;
        const onConnect = () => {
            connected++;
            console.log('Socket connected:', connected);
            if (connected === 2) {
                console.log('Both sockets connected');
                done();
            }
        };

        clientSocket1.on('connect', onConnect);
        clientSocket2.on('connect', onConnect);

        clientSocket1.on('connect_error', (err) => {
            console.error('Socket 1 connection error:', err);
        });

        clientSocket2.on('connect_error', (err) => {
            console.error('Socket 2 connection error:', err);
        });
    });

    afterEach(function(done) {
        if (clientSocket1.connected) {
            console.log('Disconnecting socket 1');
            clientSocket1.disconnect();
        }
        if (clientSocket2.connected) {
            console.log('Disconnecting socket 2');
            clientSocket2.disconnect();
        }
        done();
    });

    after(async function() {
        await clearTestDB();
        await teardownTestDB();
        server.close(() => {
            console.log('Test server closed');
        });
    });

    describe('Script Room Management', function() {
        it('should join a script room and notify other users', function(done) {
            console.log('Starting join room test');
            const scriptId = 'test-script-123';

            // First join the room with socket2
            clientSocket2.emit('joinScript', {
                scriptId,
                userId: clientSocket2.id
            });

            // Wait a bit for socket2 to join, then setup listener and emit from socket1
            setTimeout(() => {
                clientSocket2.on('userJoined', (data) => {
                    console.log('userJoined event received on socket2:', data);
                    try {
                        expect(data).to.have.property('userId');
                        expect(data).to.have.property('activeUsers');
                        expect(data.activeUsers).to.be.an('array');
                        expect(data.activeUsers).to.have.lengthOf(2); // Both users should be in the room
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

                // Now emit join from socket1
                clientSocket1.emit('joinScript', {
                    scriptId,
                    userId: clientSocket1.id
                });
            }, 100);
        });

        it('should handle multiple users in the same script room', function(done) {
            console.log('Starting multiple users test');
            const scriptId = 'test-script-123';
            let joinCount = 0;

            function handleJoin(data) {
                console.log('userJoined event received:', data);
                try {
                    expect(data).to.have.property('userId');
                    expect(data).to.have.property('activeUsers');
                    joinCount++;
                    console.log('Join count:', joinCount);
                    if (joinCount === 2) {
                        console.log('Both users joined');
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            }

            clientSocket1.on('userJoined', handleJoin);
            clientSocket2.on('userJoined', handleJoin);

            // Emit join events with delay between them
            setTimeout(() => {
                console.log('First user joining');
                clientSocket1.emit('joinScript', {
                    scriptId,
                    userId: clientSocket1.id
                });

                setTimeout(() => {
                    console.log('Second user joining');
                    clientSocket2.emit('joinScript', {
                        scriptId,
                        userId: clientSocket2.id
                    });
                }, 500);
            }, 500);
        });

        it('should notify when a user leaves the script room', async () => {
            return new Promise((resolve) => {
                const scriptId = 'test-script-123';

                clientSocket2.once('userLeft', (data) => {
                    expect(data).to.have.property('userId');
                    expect(data).to.have.property('activeUsers').that.is.an('array');
                    resolve();
                });

                clientSocket1.emit('joinScript', { scriptId, userId: 'user1' });
                clientSocket2.emit('joinScript', { scriptId, userId: 'user2' });

                setTimeout(() => {
                    clientSocket1.disconnect();
                }, 100);
            });
        });
    });

    describe('Script Content Updates', () => {
        it('should broadcast script updates to other users in the room', async () => {
            return new Promise((resolve) => {
                const scriptId = 'test-script-123';
                const updateData = {
                    scriptId,
                    content: 'Updated script content',
                    cursorPosition: { line: 1, ch: 5 }
                };

                clientSocket2.once('scriptUpdated', (data) => {
                    expect(data).to.have.property('userId');
                    expect(data).to.have.property('content', updateData.content);
                    expect(data).to.have.property('cursorPosition').that.deep.equals(updateData.cursorPosition);
                    resolve();
                });

                clientSocket1.emit('joinScript', { scriptId, userId: 'user1' });
                clientSocket2.emit('joinScript', { scriptId, userId: 'user2' });

                setTimeout(() => {
                    clientSocket1.emit('scriptUpdate', updateData);
                }, 100);
            });
        });

        it('should not receive updates from different script rooms', async () => {
            return new Promise((resolve) => {
                const scriptId1 = 'test-script-123';
                const scriptId2 = 'test-script-456';
                let updateReceived = false;

                clientSocket2.on('scriptUpdated', () => {
                    updateReceived = true;
                });

                clientSocket1.emit('joinScript', { scriptId: scriptId1, userId: 'user1' });
                clientSocket2.emit('joinScript', { scriptId: scriptId2, userId: 'user2' });

                setTimeout(() => {
                    clientSocket1.emit('scriptUpdate', {
                        scriptId: scriptId1,
                        content: 'Updated content',
                        cursorPosition: { line: 1, ch: 5 }
                    });

                    setTimeout(() => {
                        expect(updateReceived).to.be.false;
                        resolve();
                    }, 100);
                }, 100);
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid script IDs gracefully', async () => {
            return new Promise((resolve) => {
                clientSocket1.emit('joinScript', { scriptId: null, userId: 'user1' });
                setTimeout(resolve, 100);
            });
        });

        it('should handle disconnection gracefully', async () => {
            return new Promise((resolve) => {
                const scriptId = 'test-script-123';

                clientSocket2.once('userLeft', (data) => {
                    expect(data).to.have.property('userId');
                    expect(data).to.have.property('activeUsers').that.is.an('array');
                    resolve();
                });

                clientSocket1.emit('joinScript', { scriptId, userId: 'user1' });
                clientSocket2.emit('joinScript', { scriptId, userId: 'user2' });

                setTimeout(() => {
                    clientSocket1.disconnect();
                }, 100);
            });
        });
    });
}); 