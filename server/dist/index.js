"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"]
    }
});
let counter = 0;
io.on('connection', (socket) => {
    console.log(`Player ${socket.id} connected`);
    socket.data.score = 0;
    socket.data.username = "new User";
    socket.emit("updateCounter", counter);
    socket.on("incrementCounter", () => {
        counter += 1;
        console.log(`Counter updated: ${counter}`);
        io.emit("updateCounter", counter);
    });
    socket.on('message', (message) => {
        console.log(message);
        io.emit('message', `${socket.data.username} with score ${socket.data.score} said ${message}.`);
        socket.data.score += 1;
    });
    socket.on('newUsername', (username) => {
        console.log(username);
        io.emit('message', `${socket.data.username} changed his username to ${username}`);
        socket.data.username = username;
    });
    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected`);
    });
});
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
