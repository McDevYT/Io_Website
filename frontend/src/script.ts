import { Application, Assets, Point, Sprite, Texture, Ticker, TilingSprite } from "pixi.js";

let app: Application;

const textures: Record<string, Texture> = {};
const players: Record<string, Sprite> = {};
const playersData: Record<string, Player> = {};
const keysPressed: Record<string, boolean> = {};

const pingText = document.getElementById("topBarText") as HTMLParagraphElement;
let ping: any;

let background: TilingSprite;

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

app = new Application();
await app.init({ background: '#1099bb', resizeTo: window });
document.body.appendChild(app.canvas);


await (async function preloadAssets() {
    console.log("Loading Assets");

    // Center the stage
    app.stage.pivot.set(-app.screen.width, -app.screen.height);

    const assets = [
        "player_1.png",
        "player_2.png",
        "player_3.png",
        "player_4.png",
        "backgroundTile.png",
    ];

    await Promise.all(assets.map(async (name) =>{
        textures[name] = await Assets.load(name);
    }));

    background = new TilingSprite({
        texture: textures["backgroundTile.png"],
        width: 300,
        height: 300,
        scale: 2,
    }
    );

        // Set pivot to the center of the tiling sprite
    // Set pivot to center the background around (0,0)
    background.pivot = background.width / 2;

    // Set position to (0,0) so the center is at the stage origin
    background.position.set(0, 0);

    app.stage.addChild(background);

    console.log("Finished loading!");
    startGame();
})();

const socket = io('http://localhost:3000');

function startGame(){
    app.ticker.add(update);
    document.addEventListener("pointermove", (e) =>{
        console.log("updating rotation");
        const localPlayer = players[socket.id];
        if (!localPlayer) return;

        const mousePos = app.stage.toLocal(new Point(e.pageX, e.pageY));
    
        const angle = Math.atan2(mousePos.y - localPlayer.y, mousePos.x - localPlayer.x );
        localPlayer.rotation = angle;
        socket.emit("rotate", angle);
    });
}

function update(delta: Ticker){
    for (const id in players) {
        const sprite = players[id];
        const playerData = playersData[id];

        if (!sprite || !playerData) continue;

        const lerpFactor = 0.1; // Adjust for smoother or faster movement
        sprite.x += (playerData.x - sprite.x) * lerpFactor;
        sprite.y += (playerData.y - sprite.y) * lerpFactor;

        if (id !== socket.id) {
            let deltaRotation = (playerData.rotation - sprite.rotation + Math.PI) % (2 * Math.PI) - Math.PI;
            sprite.rotation += deltaRotation * lerpFactor;
        }
    }
 
    updateCameraPos();
}

socket.on("updatePlayers", (serverPlayers: Record<string, Player>) => {
    console.log("Received updatePlayers event");
    for (const player of Object.values(serverPlayers)) {
        let sprite = players[player.id];

        playersData[player.id] = player;

        if (!sprite) {
            const texture = textures[player.texture] || textures["green_character.png"];
            sprite = new Sprite(texture);
            sprite.anchor = 0.5;
            sprite.scale = 2.5;
            app.stage.addChild(sprite);
            players[player.id] = sprite;
        } 

        sprite.x = player.x;
        sprite.y = player.y;
    }

    for (const id of Object.keys(players)) {
        if (!serverPlayers[id]) {
            app.stage.removeChild(players[id]);
            delete players[id];
        }
    }
});

socket.on("movePlayers", (serverPlayers: Record<string, {x: number, y: number}>) => {
    console.log("Received movePlayers event");

    for (const id in serverPlayers) {
        let playerData = playersData[id];

        if (playerData) {
            playerData.x = serverPlayers[id].x;
            playerData.y = serverPlayers[id].y;
        } 
    }

    console.log(`${serverPlayers[socket.id]?.x}  ${serverPlayers[socket.id]?.y}`);
});

socket.on("rotatePlayers", (playerRotations: Record<string, number>) => {
    for (const id in playerRotations) 
        playersData[id].rotation = playerRotations[id]; 
});

window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if(!keysPressed[key]){
        keysPressed[key] = true;
        socket.emit("move", keysPressed);
    }
});

window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if(keysPressed[key]){
        keysPressed[key] = false;
        socket.emit("move", keysPressed);
    }
});

setInterval(() => {
    const start = Date.now();
    
    socket.emit("ping", () => {
        ping = Date.now() - start;
        pingText.innerText = "ping: " + ping + "ms";
    });
}, 1000);

function updateCameraPos(){
    const localPlayer = players[socket.id];
    if (!localPlayer) return;

    const cameraSpeed = 1;
    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;

    const targetX = -localPlayer.x - centerX;
    const targetY = -localPlayer.y - centerY;

    app.stage.x += (targetX - app.stage.x) * cameraSpeed;
    app.stage.y += (targetY - app.stage.y) * cameraSpeed;
}

document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });