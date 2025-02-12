// Track active users in each script room
const activeScripts = new Map();

module.exports = (io) => {
    // Store active users for each script
    const scriptRooms = new Map();

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('joinScript', ({ scriptId, userId }) => {
            console.log(`Join script request received:`, { scriptId, userId, socketId: socket.id });
            
            if (!scriptId) {
                console.log('Invalid scriptId, returning');
                return;
            }

            // Join the room
            socket.join(scriptId);
            console.log(`Socket ${socket.id} joined room ${scriptId}`);

            // Initialize room if it doesn't exist
            if (!scriptRooms.has(scriptId)) {
                console.log(`Creating new room for script ${scriptId}`);
                scriptRooms.set(scriptId, new Set());
            }

            // Add user to room
            const room = scriptRooms.get(scriptId);
            room.add(socket.id);
            console.log(`Added user ${socket.id} to room ${scriptId}`);
            console.log(`Current users in room:`, Array.from(room));

            // Notify ALL clients in the room
            const eventData = {
                userId: socket.id,
                activeUsers: Array.from(room)
            };
            console.log(`Emitting userJoined event:`, eventData);
            io.in(scriptId).emit('userJoined', eventData);
        });

        socket.on('scriptUpdate', (data) => {
            if (!data || !data.scriptId) return;
            
            // Broadcast update to others in the room
            socket.to(data.scriptId).emit('scriptUpdated', {
                userId: socket.id,
                content: data.content,
                cursorPosition: data.cursorPosition
            });
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            
            // Remove user from all rooms they were in
            scriptRooms.forEach((users, scriptId) => {
                if (users.has(socket.id)) {
                    users.delete(socket.id);
                    
                    // Notify others in the room
                    io.to(scriptId).emit('userLeft', {
                        userId: socket.id,
                        activeUsers: Array.from(users)
                    });

                    // Clean up empty rooms
                    if (users.size === 0) {
                        scriptRooms.delete(scriptId);
                    }
                }
            });
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error(`Socket error for client ${socket.id}:`, error);
        });
    });

    // Monitor socket.io errors
    io.engine.on('connection_error', (error) => {
        console.error('Connection error:', error);
    });
}; 