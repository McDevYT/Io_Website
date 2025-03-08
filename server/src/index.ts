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
    texture: string;
    username: string;
    speed: number;
    keys: Record<string, boolean>;
}

const players: Record<string, Player> = {};

io.on('connection', (socket: Socket) => {
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
    socket.on("move", (keysPressed: Record<string, boolean>) => {
        if (players[socket.id]){
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

setInterval(()=>{
    const movedPlayers: Record<string, Player> = {};

    for (const id in players) {
        const player = players[id];
        const speed = player.speed;
    
        let moved = false;
        
        if (player.keys.w) { player.y -= speed; moved = true; }
        if (player.keys.s) { player.y += speed; moved = true; }
        if (player.keys.a) { player.x -= speed; moved = true; }
        if (player.keys.d) { player.x += speed; moved = true; }
    
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
