const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const users = {}; // Store users by their socket ID

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Set username for the connected user
    socket.on('setUsername', (username) => {
        users[socket.id] = username; // Map socket ID to username   

        // Broadcast a user join notification
        socket.broadcast.emit('notification', {
            message: `${username} has joined the chat.`,
            type: 'user-joined',
        });
    });


    socket.on('typing', () => {
        const username = users[socket.id];
        if (username) {
            socket.broadcast.emit('typing', username); // Notify others
        }
    });

    // Listen for stopTyping event
    socket.on('stopTyping', () => {
        socket.broadcast.emit('notTyping'); // Notify others
    });
    // Listen for chat messages
    socket.on('chatMessage', (data) => {
        io.emit('chatMessage', data); // Broadcast the message to all clients
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            console.log(`${username} disconnected`);
            delete users[socket.id]; // Remove user from the list

            // Broadcast a user leave notification
            io.emit('notification', {
                message: `${username} has left the chat.`,
                type: 'user-left',
            });
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
