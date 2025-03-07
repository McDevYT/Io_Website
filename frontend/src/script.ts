const socket = io('http://localhost:3000');

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

interface Player {
    id: string;
    x: number;
    y: number;
    color: string;
    username: string;
    speed: number;
}

let players: Record<string, Player> = {};
const keysPressed: Record<string, boolean> = { w: false, a: false, s: false, d: false };

socket.on("updatePlayers", (updatedPlayers: Record<string, Player>) => {
    players = updatedPlayers;
    drawPlayers();
});

function drawPlayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const id in players) {
        const player = players[id];
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key in keysPressed) {
        keysPressed[event.key] = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key in keysPressed) {
        keysPressed[event.key] = false;
    }
});
