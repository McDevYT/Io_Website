import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static("public"));

interface PlayerSocket extends Socket{
    data:{
        score: number;
        username: string;
    }
}

let counter = 0;

io.on('connection', (socket: PlayerSocket) => {
    console.log(`Player ${socket.id} connected`);

    socket.data.score = 0;
    socket.data.username = "new User";

    socket.emit("updateCounter", counter);

    socket.on("incrementCounter", () => {
        counter += 1;
        console.log(`Counter updated: ${counter}`);

        io.emit("updateCounter", counter);
    });

    socket.on('message', (message: string) => {
        console.log(message);
        io.emit('message', `${socket.data.username} with score ${socket.data.score} said ${message}.` );   
        socket.data.score += 1;
    });

    socket.on('newUsername', (username: string) => {
        console.log(username);
        io.emit('message', `${socket.data.username} changed his username to ${username}` );   
        socket.data.username = username;
    });

    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected`);
    });
});

server.listen(3000,() =>{
    console.log("Server is running on http://localhost:3000");
});

