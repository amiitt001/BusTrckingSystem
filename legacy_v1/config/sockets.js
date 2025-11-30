module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('busLocation', (data) => {
            console.log('Received location:', data);
            // Broadcast the location to all connected clients (including the map)
            io.emit('busLocation', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};
