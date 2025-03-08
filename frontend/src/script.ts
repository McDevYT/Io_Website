import { Application, Assets, Sprite, Texture, TilingSprite } from "pixi.js";

let app: Application;

const textures: Record<string, Texture> = {};
const players: Record<string, Sprite> = {};
const keysPressed: Record<string, boolean> = {};

const pingText = document.getElementById("topBarText") as HTMLParagraphElement;
let ping: any;

let background: TilingSprite;

interface Player {
    id: string;
    x: number;
    y: number;
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
    app.stage.pivot.set(app.screen.width / 2, app.screen.height / 2);

    // Move the stage to the center of the screen
    app.stage.position.set(app.screen.width / 2, app.screen.height / 2);

    const assets = [
        "green_character.png",
        "purple_character.png",
        "yellow_character.png",
        "red_character.png",
        "backgroundTile.png",
    ];

    await Promise.all(assets.map(async (name) =>{
        textures[name] = await Assets.load(name);
    }));

    background = new TilingSprite({
        texture: textures["backgroundTile.png"],
        width: app.screen.width * 2,
        height: app.screen.height * 2
    }
    );

    app.stage.addChild(background);


    console.log("Finished loading!");

})();

// Store player sprites
const socket = io('http://localhost:3000');

// Listen for player updates from the server
socket.on("updatePlayers", (serverPlayers: Record<string, Player>) => {
    console.log("Received updatePlayers event");
    for (const player of Object.values(serverPlayers)) {
        let sprite = players[player.id];

        if (!sprite) {
            const texture = textures[player.texture] || textures["green_character.png"];
            sprite = new Sprite(texture);
            sprite.anchor = 0.5;
            app.stage.addChild(sprite);
            players[player.id] = sprite;
        } 

        sprite.x = player.x;
        sprite.y = player.y;
    }

    // Remove players that no longer exist
    for (const id of Object.keys(players)) {
        if (!serverPlayers[id]) {
            app.stage.removeChild(players[id]);
            delete players[id];
        }
    }
});

socket.on("movePlayers", (serverPlayers: Record<string, Player>) => {
    console.log("Received movePlayers event");

    for (const player of Object.values(serverPlayers)) {
        let sprite = players[player.id];

        if (sprite) {
            sprite.x = player.x;
            sprite.y = player.y;
        } 
    }

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

// Camera update loop to follow the player
function updateCamera() {
    // Find the first player (assuming the local player's sprite is present)
    const localPlayer = Object.values(players)[0]; // You can modify this to track your specific player

    if (!localPlayer) return; // Exit if no local player exists

    const cameraSpeed = 0.1; // Camera smoothing factor
    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;

    // Calculate the desired camera position based on the player's position
    const targetX = localPlayer.x - centerX;
    const targetY = localPlayer.y - centerY;

    // Smoothly move the stage to the target position
    app.stage.x += (targetX - app.stage.x) * cameraSpeed;
    app.stage.y += (targetY - app.stage.y) * cameraSpeed;

    // Optional: Clamp stage position to prevent it from going beyond the world bounds
    app.stage.x = Math.max(app.screen.width - app.screen.width * 2, Math.min(0, app.stage.x));
    app.stage.y = Math.max(app.screen.height - app.screen.height * 2, Math.min(0, app.stage.y));

    console.log("Updated Camera")

    requestAnimationFrame(updateCamera);
}
updateCamera();
