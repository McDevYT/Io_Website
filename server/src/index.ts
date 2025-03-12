import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const positionEmitIntervall = 25;

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
    rotation: number;
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

    socket.on('joinGame',(username: string) => {
        players[socket.id] = {
            id: socket.id,
            x: 0,
            y: 0,
            rotation: 90,
            texture: "player_4.png",
            username: username,
            speed: 500,
            keys: {}
        };
    
        console.log(Object.values(players).length);
    
        io.emit("updatePlayers", players);

        const handleChatMessage = (message: string) => {
            io.emit("chatMessage", `${players[socket.id].username}: ${message}`);
        };

        const handleMove = (keysPressed: Record<string, boolean>) => {
            if (players[socket.id]){
                players[socket.id].keys = keysPressed;
            }
        };

        const handleRotate = (angle: number) => {
            if (players[socket.id]){
                players[socket.id].rotation = angle;
            }
        };
        socket.on("chatMessage", handleChatMessage);
        socket.on("move", handleMove);
        socket.on("rotate", handleRotate);

        socket.on("leaveGame", () => {
            socket.off("chatMessage", handleChatMessage);
            socket.off("move", handleMove);
            socket.off("rotate", handleRotate);

            console.log(`Player ${socket.id} left the game`);
            delete players[socket.id];
            io.emit("updatePlayers", players);
        });

    });
    
    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected`);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

setInterval(()=>{
    const movedPlayers: Record<string, {x: number,y: number}> = {};
    const playerRotations: Record<string, number> = {};

    for (const id in players) {
        const player = players[id];
        const speed = player.speed;
    
        let moved = false;
        
        if (player.keys.w) { player.y -= speed / positionEmitIntervall; moved = true; }
        if (player.keys.s) { player.y += speed / positionEmitIntervall; moved = true; }
        if (player.keys.a) { player.x -= speed / positionEmitIntervall; moved = true; }
        if (player.keys.d) { player.x += speed / positionEmitIntervall; moved = true; }
    
        player.x = Math.max(-500, Math.min(player.x, 500));
        player.y = Math.max(-500, Math.min(player.y, 500));

        if (moved) {
            movedPlayers[id] = { x:player.x,y: player.y};
        }
        playerRotations[id] = player.rotation;
    }

    if (Object.keys(movedPlayers).length != 0)
        io.emit("movePlayers", movedPlayers);
    io.emit("rotatePlayers", playerRotations);


}, 1000 / positionEmitIntervall);

server.listen(3000,"0.0.0.0", () => {
    console.log(`Server is running on port 3000`);
});