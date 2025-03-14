import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { Player } from './types';
import { executeCommand } from './consoleHandler';

export const players: Record<string, Player> = {};

const positionEmitIntervall = 25;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

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
            texture: "player1.png",
            username: username.replace(" ", ""),
            speed: 500,
            health: 10,
            keys: {},
            isAdmin: false
        };

        console.log(`Player ${username} with id ${socket.id} joined the game`);
    
        io.emit("updatePlayers", players);

        const handleChatMessage = (message: string) => {
            console.log( `${players[socket.id].username}: ${message}`);
            if (!message.startsWith("/"))
                io.emit("chatMessage", `${players[socket.id].username}: ${message}`);
            else
                executeCommand(message, socket.id);
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

        const handleLeaveGame = () => {
            socket.off("chatMessage", handleChatMessage);
            socket.off("move", handleMove);
            socket.off("rotate", handleRotate);
            socket.off("leaveGame", handleLeaveGame);

            console.log(`Player ${socket.id} left the game`);
            delete players[socket.id];
            io.emit("updatePlayers", players);
        }

        socket.on("chatMessage", handleChatMessage);
        socket.on("move", handleMove);
        socket.on("rotate", handleRotate);
        socket.on("leaveGame", handleLeaveGame);
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

export function getIdFromUsername(username: string){
    const id = Object.values(players).find((player) => player.username == username)?.id || "";
    return id;
}

export function getPlayerFromUsername(username: string){
    const player = Object.values(players).find((player) => player.username == username)
    return player;
}

export function disconnectSocket(id: string){
    io.sockets.sockets.get(id)?.disconnect(true);
}

export function showGameAlert(alert: string){
    io.sockets.emit("showAlert", alert);
}