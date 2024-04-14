"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = void 0;
const socket_io_1 = require("socket.io");
let users = [];
const SocketServer = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            // origin: 'http://localhost:5173' 
            // origin: 'https://scaleb-frontend-4qtpugzb0-ahammed-alis-projects.vercel.app'
            origin: process.env.FRONTEND_URL
        }
    });
    io.on("connection", (socket) => {
        // when connected
        console.log('A user is connected');
        // send message to the client we can use emit
        io.emit("welcome", "this is socket server");
        //add user to the array
        socket.on('addUser', (userId) => {
            addUser(userId, socket.id);
            io.emit('onlineUsers', users);
        });
        // send and get message
        socket.on('sendMessage', ({ senderId, receiverId, text, imageUrl }) => {
            const user = getUser(receiverId);
            // console.log('chat from sendmessage is',text,'----sender',senderId, '--reciever--',receiverId)
            if (user && user.socketId) {
                io.to(user.socketId).emit('getMessage', {
                    senderId,
                    text,
                    createdAt: new Date().toISOString(),
                    receiverId,
                    imageUrl
                });
            }
            else {
                console.log('user is not found');
            }
        });
        socket.on('typing', ({ senderId, receiverId }) => {
            // console.log('sender id ', senderId, 'reciever id', receiverId);
            const user = getUser(receiverId);
            // console.log('user is ===', user);
            if (user && user.socketId) {
                io.to(user.socketId).emit('statusTyping', {
                    senderId
                });
            }
            else {
                console.error('User or socketId not found');
            }
        });
        // when disconnected
        socket.on("disconnect", () => {
            console.log('a user disconnected');
            removeUser(socket.id);
            io.emit('getUsers', users);
        });
    });
    const addUser = (userId, socketId) => {
        !users.some((user) => user.userId === userId) &&
            users.push({ userId, socketId });
    };
    const removeUser = (socketId) => {
        users = users.filter((user) => user.socketId !== socketId);
    };
    const getUser = (userId) => {
        return users.find(user => user.userId == userId);
    };
    io.listen(3001);
    return io;
};
exports.SocketServer = SocketServer;
