import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500", // Allow only this origin
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`Player ${socket.id} connected`);

    socket.on('message', (message: string) => {
        console.log(message);
        io.emit('message', `${socket.id} said ${message}.` );   
    });

    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected`);
    });
});

server.listen(3000, () =>{
    console.log("Server is running on http://localhost:3000");
});