const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Replit automatically sets the PORT, or we default to 3000
const PORT = process.env.PORT || 3000;

// Tell Express to serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for the User's Map
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for the Driver's App
app.get('/driver', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'driver.html'));
});

// Socket.io connection handling
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

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});