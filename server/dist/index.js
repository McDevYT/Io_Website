"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const positionEmitIntervall = 25;
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
        x: 0,
        y: 0,
        rotation: 90,
        texture: "player_4.png",
        username: "New User",
        speed: 500,
        keys: {}
    };
    console.log(Object.values(players).length);
    io.emit("updatePlayers", players);
    socket.on("chatMessage", (message) => {
        io.emit("chatMessage", `${players[socket.id].username}: ${message}`);
    });
    socket.on("move", (keysPressed) => {
        if (players[socket.id]) {
            players[socket.id].keys = keysPressed;
        }
    });
    socket.on("rotate", (angle) => {
        if (players[socket.id]) {
            players[socket.id].rotation = angle;
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
    const playerRotations = {};
    for (const id in players) {
        const player = players[id];
        const speed = player.speed;
        let moved = false;
        if (player.keys.w) {
            player.y -= speed / positionEmitIntervall;
            moved = true;
        }
        if (player.keys.s) {
            player.y += speed / positionEmitIntervall;
            moved = true;
        }
        if (player.keys.a) {
            player.x -= speed / positionEmitIntervall;
            moved = true;
        }
        if (player.keys.d) {
            player.x += speed / positionEmitIntervall;
            moved = true;
        }
        player.x = Math.max(-500, Math.min(player.x, 500));
        player.y = Math.max(-500, Math.min(player.y, 500));
        if (moved) {
            movedPlayers[id] = { x: player.x, y: player.y };
        }
        playerRotations[id] = player.rotation;
    }
    if (Object.keys(movedPlayers).length != 0)
        io.emit("movePlayers", movedPlayers);
    io.emit("rotatePlayers", playerRotations);
}, 1000 / positionEmitIntervall);
server.listen(3000, "0.0.0.0", () => {
    console.log("Server is running on http://localhost:3000");
});
