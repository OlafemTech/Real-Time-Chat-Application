const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Store active users and their rooms
const users = new Map();
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', ({ username, room }) => {
        users.set(socket.id, { username, room });
        socket.join(room);

        // Add room to rooms map if it doesn't exist
        if (!rooms.has(room)) {
            rooms.set(room, new Set());
        }
        rooms.get(room).add(socket.id);

        // Notify room members
        socket.to(room).emit('userJoined', {
            username: username,
            message: `${username} has joined the chat`
        });

        // Send room users list
        io.to(room).emit('roomUsers', {
            room: room,
            users: Array.from(rooms.get(room)).map(id => users.get(id).username)
        });
    });

    socket.on('chatMessage', (message) => {
        const user = users.get(socket.id);
        if (user) {
            io.to(user.room).emit('message', {
                username: user.username,
                text: message,
                time: new Date().toLocaleTimeString()
            });
        }
    });

    socket.on('typing', ({ username, room }) => {
        socket.to(room).emit('userTyping', { username });
    });

    socket.on('stopTyping', ({ username, room }) => {
        socket.to(room).emit('userStoppedTyping', { username });
    });

    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            const room = rooms.get(user.room);
            if (room) {
                room.delete(socket.id);
                if (room.size === 0) {
                    rooms.delete(user.room);
                }
            }
            users.delete(socket.id);

            io.to(user.room).emit('userLeft', {
                username: user.username,
                message: `${user.username} has left the chat`
            });

            // Update room users list
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: Array.from(room || []).map(id => users.get(id)?.username).filter(Boolean)
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
