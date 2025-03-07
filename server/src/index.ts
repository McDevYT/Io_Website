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

interface Player {
    id: string;
    x: number;
    y: number;
    color: string;
    username: string;
    speed: number;
}

const players: Record<string, Player> = {};

const getRandomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16);

io.on('connection', (socket: Socket) => {
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

    // Handle movement
    socket.on("move", (keysPressed: Record<string, boolean>) => {
        const player = players[socket.id];
        if (!player) return;

        const speed = player.speed;

        // Update the player's position based on the keys pressed
        if (keysPressed.w) player.y -= speed;
        if (keysPressed.s) player.y += speed;
        if (keysPressed.a) player.x -= speed;
        if (keysPressed.d) player.x += speed;

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
