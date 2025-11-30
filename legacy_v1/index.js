require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const socketHandler = require('./config/sockets');
const pageRoutes = require('./routes/pages');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Default port
const PORT = process.env.PORT || 3000;

// Tell Express to serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Use Routes
app.use('/', pageRoutes);

// Initialize Socket.io logic
socketHandler(io);

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});