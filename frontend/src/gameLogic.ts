import {  Assets, Container, Point, Sprite, Texture, Ticker, TilingSprite, Text, TextStyle, Application } from "pixi.js";
import { Player } from './types';
import * as socket from "./socketHandler";
import { ASSETS } from "./constants";

export let app: Application = new Application();

export let keysPressed: Record<string, boolean> = {};
export const textures: Record<string, Texture> = {};
let playerContainers: Record<string, Container> = {};
let playersSprites: Record<string, Sprite> = {};
let players: Record<string, Player> = {};

let background: TilingSprite;

export async function initializeGame() {
    await app.init({ background: '#1099bb', resizeTo: window });
    app.stage.pivot.set(-app.screen.width, -app.screen.height);

    await Promise.all(ASSETS.map(async (name) =>{
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
}

export function startGame(){

    app.ticker.add(update);
    document.addEventListener("pointermove", (e) =>{
        const playerContainer = playerContainers[socket.id];
        if (!playerContainer) return;

        const mousePos = app.stage.toLocal(new Point(e.pageX, e.pageY));
    
        const angle = Math.atan2(mousePos.y - playerContainer.y, mousePos.x - playerContainer.x );
        playerContainer.children[0].rotation = angle;
        socket.emitRotate(angle);
    });
}

function update(delta: Ticker){

    /*const player = playersData[socket.id];
    if (player){

        if (player.keys.w) player.y -= player.speed * delta.deltaTime; 
        if (player.keys.s) player.y += player.speed * delta.deltaTime; 
        if (player.keys.a) player.x -= player.speed * delta.deltaTime; 
        if (player.keys.d) player.x += player.speed * delta.deltaTime; 
    
        player.x = Math.max(-500, Math.min(player.x, 500));
        player.y = Math.max(-500, Math.min(player.y, 500));
    }*/

    for (const id in playerContainers) {
        const spriteContainer = playerContainers[id];
        const playerData = players[id];

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

export function updatePlayers(serverPlayers: Record<string, Player>) {
   console.log(serverPlayers[socket.id]);
    for (const player of Object.values(serverPlayers)) {
        let playerContainer = playerContainers[player.id];

        players[player.id] = player;

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
}

export function keyChanged(key: string, isPressed: boolean) {
    if (Object.values(players).length && keysPressed[key] !== isPressed) {
        keysPressed[key] = isPressed;
        players[socket.id].keys = keysPressed; 
        socket.emitMove(keysPressed);
    }
}

export function movePlayers(serverPlayers: Record<string, {x: number, y: number}>) {
    for (const id in serverPlayers) {
        let playerData = players[id];

        if (playerData) {
            playerData.x = serverPlayers[id].x;
            playerData.y = serverPlayers[id].y;
        } 
    }
}

export function rotatePlayers(playerRotations: Record<string, number>) {
    for (const id in playerRotations) 
        players[id].rotation = playerRotations[id]; 
}

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

export function leaveGame(){
    Object.values(playerContainers).forEach((container) => app.stage.removeChild(container));

    cleareGameData();

    app.ticker.remove(update);
}

function cleareGameData(){
    players = {};
    keysPressed = {};
    playerContainers = {};
}