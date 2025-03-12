import { Application, Assets, Container, Point, Sprite, Texture, Ticker, TilingSprite, Text, TextStyle } from "pixi.js";

let app: Application;

const textures: Record<string, Texture> = {};
const playerContainers: Record<string, Container> = {};
const playersSprites: Record<string, Sprite> = {};
const playersData: Record<string, Player> = {};
const keysPressed: Record<string, boolean> = {};

const chatMessages = document.getElementById("chatMessages") as HTMLUListElement;
const chatInput = document.getElementById("chatInput") as HTMLInputElement;

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
        width: 2000,
        height: 1000,
        scale: 2,
    }
    );

    background.pivot = new Point(background.width / 2,background.height/2);

    background.position.set(0, 0);

    app.stage.addChild(background);

    console.log("Finished loading!");

})();

const socket = io('http://10.6.11.18:3000');

function startGame(){
    fadeOut(document.getElementById("mainMenu") as HTMLElement);

    app.ticker.add(update);
    document.addEventListener("pointermove", (e) =>{
        const playerContainer = playerContainers[socket.id];
        if (!playerContainer) return;

        const mousePos = app.stage.toLocal(new Point(e.pageX, e.pageY));
    
        const angle = Math.atan2(mousePos.y - playerContainer.y, mousePos.x - playerContainer.x );
        playerContainer.children[0].rotation = angle;
        socket.emit("rotate", angle);
    });
}

function update(delta: Ticker){
    for (const id in playerContainers) {
        const spriteContainer = playerContainers[id];
        const playerData = playersData[id];

        if (!spriteContainer || !playerData) continue;

        const lerpFactor = 0.15;
        spriteContainer.x += (playerData.x - spriteContainer.x) * lerpFactor * delta.deltaTime;
        spriteContainer.y += (playerData.y - spriteContainer.y) * lerpFactor * delta.deltaTime;

        if (id !== socket.id) {
            const rotationLerpFactor = 0.16;
            let targetRotation = playerData.rotation;
            let currentRotation = spriteContainer.children[0].rotation;
        
            let deltaRotation = rLerp(currentRotation,targetRotation,rotationLerpFactor);
        
            spriteContainer.children[0].rotation = deltaRotation;
        }
    }
 
    updateCameraPos(delta);
}

function rLerp (A:number, B:number, w:number) {
    let CS = (1-w)*Math.cos(A) + w*Math.cos(B);
    let SN = (1-w)*Math.sin(A) + w*Math.sin(B);
    return Math.atan2(SN,CS);
}

socket.on("updatePlayers", (serverPlayers: Record<string, Player>) => {
    for (const player of Object.values(serverPlayers)) {
        let playerContainer = playerContainers[player.id];

        playersData[player.id] = player;

        if (!playerContainer) {
            const texture = textures[player.texture] || textures["player_1.png"];
            const sprite = new Sprite(texture);
            playerContainer = new Container();
            playerContainers[player.id] = playerContainer;
            playersSprites[player.id] = sprite;

            sprite.anchor = 0.5;
            sprite.scale = 2.5;

            const style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: 20,
                fontWeight: 'bold',
                wordWrap: true,
                wordWrapWidth: 440,
            });

            const usernameText = new Text({
                text: player.username,
                style
            });

            usernameText.anchor.set(0.5);
            usernameText.y = -40;

            playerContainer.addChild(sprite);
            playerContainer.addChild(usernameText);

            app.stage.addChild(playerContainer);
            playerContainers[player.id] = playerContainer;
        } 

        playerContainer.x = player.x;
        playerContainer.y = player.y;
    }

    for (const id of Object.keys(playerContainers)) {
        if (!serverPlayers[id]) {
            app.stage.removeChild(playerContainers[id]);
            delete playerContainers[id];
        }
    }
});

socket.on("chatMessage", (message: string) => {
    addChatMessage(message);
    console.log(message);
});

socket.on("movePlayers", (serverPlayers: Record<string, {x: number, y: number}>) => {

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

function updateCameraPos(delta: Ticker){
    const localPlayer = playerContainers[socket.id];
    if (!localPlayer) return;

    const cameraSpeed = 0.4;
    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;

    const targetX = -localPlayer.x - centerX;
    const targetY = -localPlayer.y - centerY;

    app.stage.x += (targetX - app.stage.x) * cameraSpeed * delta.deltaTime;
    app.stage.y += (targetY - app.stage.y) * cameraSpeed * delta.deltaTime;
}

function addChatMessage(message: string){
    if (!message.trim()) return;

    const messageElement = document.createElement("li");
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatInput.addEventListener("keydown", (event) =>{
    const message = chatInput.value;
    if (event.key == "Enter" && message.trim()){
        event.preventDefault();
        socket.emit("chatMessage", message);
        chatInput.value = "";
    }
})

document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

function showPopup(message: string): void {
    const popUp = document.getElementById("popUp") as HTMLElement;
    const popUpText = document.getElementById("popUpText") as HTMLElement;
    popUp.style.visibility = "visible";

    popUpText.textContent = message;
    fadeIn(popUp);
}

function hidePopup(): void {
    const popUp = document.getElementById("popUp") as HTMLElement;
    fadeOut(popUp);
}

function fadeIn(element: HTMLElement){
    
    element.style.opacity = '1';

    element.classList.remove('fade');
    element.style.pointerEvents = 'auto';
}

function fadeOut(element: HTMLElement){

    element.style.opacity = '0';

    element.addEventListener('transitionend', () => {
        element.style.pointerEvents = 'none';
    }, { once: true });

    element.classList.add('fade');
}

document.getElementById("startGameButton")?.addEventListener("click", () => {
    try{
        startGame();
    }catch{
        showPopup("Failed!");
    }
});

socket.on("connect_error", (error: string) => {
    showPopup(error);
});

socket.on("error", (error: string) => {
    showPopup(error);
});

document.querySelector("#popUp button")?.addEventListener("click", () => {
    hidePopup();
});