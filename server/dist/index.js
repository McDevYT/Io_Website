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
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const players = {};
const getRandomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16);
io.on('connection', (socket) => {
    console.log(`Player ${socket.id} connected`);
    // Initialize player with random position and color
    players[socket.id] = {
        id: socket.id,
        x: Math.random() * 400,
        y: Math.random() * 400,
        color: getRandomColor(),
        username: "New User",
        speed: 5
    };
    const player = players[socket.id];
    // Emit initial player data to all clients
    io.emit("updatePlayers", players);
    // Handle username change
    socket.on('newUsername', (username) => {
        console.log(username);
        socket.data.username = username;
    });
    // Handle movement
    socket.on("move", (keysPressed) => {
        const player = players[socket.id];
        if (!player)
            return;
        const speed = player.speed;
        // Update the player's position based on the keys pressed
        if (keysPressed.w)
            player.y -= speed;
        if (keysPressed.s)
            player.y += speed;
        if (keysPressed.a)
            player.x -= speed;
        if (keysPressed.d)
            player.x += speed;
        // Emit the updated players' positions to all clients
        io.emit("updatePlayers", players);
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected`);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
