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
io.on('connection', (socket) => {
    console.log(`Player ${socket.id} connected`);
    socket.on("ping", (callback) => {
        callback();
    });
    // Initialize player with random position and color
    players[socket.id] = {
        id: socket.id,
        x: Math.random() * 400,
        y: Math.random() * 400,
        texture: "green_character.png",
        username: "New User",
        speed: 10,
        keys: {}
    };
    console.log(Object.values(players).length);
    io.emit("updatePlayers", players);
    // Handle movement
    socket.on("move", (keysPressed) => {
        if (players[socket.id]) {
            players[socket.id].keys = keysPressed;
        }
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected`);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});
setInterval(() => {
    const movedPlayers = {};
    for (const id in players) {
        const player = players[id];
        const speed = player.speed;
        let moved = false;
        if (player.keys.w) {
            player.y -= speed;
            moved = true;
        }
        if (player.keys.s) {
            player.y += speed;
            moved = true;
        }
        if (player.keys.a) {
            player.x -= speed;
            moved = true;
        }
        if (player.keys.d) {
            player.x += speed;
            moved = true;
        }
        if (moved) {
            movedPlayers[id] = player;
        }
    }
    if (Object.keys(movedPlayers).length != 0)
        io.emit("movePlayers", movedPlayers);
}, 1000 / 60);
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
