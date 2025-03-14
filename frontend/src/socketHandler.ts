import { SOCKET_EVENTS, SERVER_IP } from "./constants";
import { updatePlayers, movePlayers, rotatePlayers, leaveGame } from './gameLogic';
import { showPopup, addChatMessage, setPingText, switchOverlay, showGameAlert } from "./uiHandler";

let socket = io(SERVER_IP);


export let ping: any;
export let id: any;

const disconnected = () => {
    switchOverlay("mainMenu");
    console.log("Disconnected!");
    showPopup("Disconnected!");
    leaveGame();
    
    setTimeout(() => {
        if (!socket.connected) {
            console.log("Attempting to reconnect...");
            socket.connect(); // Explicitly reconnect
        }
    }, 200);
};

const error = (error: string) => {
    showPopup('Failed to connect to server: ' + error);
};

const connected = () => {
    socket.removeAllListeners();
    id = socket.id;
    console.log(`Changed id to ${id}`);
    socket.on(SOCKET_EVENTS.CONNECT_ERROR, error);
    socket.on(SOCKET_EVENTS.ERROR, error);
    socket.on('showAlert', showAlert);
    socket.on('disconnect', disconnected);
};

const showAlert = (alert: string) => {
    showGameAlert(alert);
};

export function initializeSocketHandlers() {
    socket.on(SOCKET_EVENTS.UPDATE_PLAYERS, updatePlayers);
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, addChatMessage);
    socket.on(SOCKET_EVENTS.MOVE_PLAYERS, movePlayers);
    socket.on(SOCKET_EVENTS.ROTATE_PLAYERS, rotatePlayers);
}

export function disconnectGame(){
    socket.off(SOCKET_EVENTS.UPDATE_PLAYERS, updatePlayers);
    socket.off(SOCKET_EVENTS.CHAT_MESSAGE, addChatMessage);
    socket.off(SOCKET_EVENTS.MOVE_PLAYERS, movePlayers);
    socket.off(SOCKET_EVENTS.ROTATE_PLAYERS, rotatePlayers);

    socket.emit(SOCKET_EVENTS.LEAVE_GAME);
}

export function emitMove(keysPressed: Record<string, boolean>) {
    socket.emit(SOCKET_EVENTS.MOVE, keysPressed);
}

export function emitRotate(angle: number) {
    socket.emit(SOCKET_EVENTS.ROTATE, angle);    
}

export function emitJoinGame(username: string){
    initializeSocketHandlers();
    socket.emit(SOCKET_EVENTS.JOIN_GAME, username);
}

export function emitMessage(message: string){
    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, message);
}

export function getSocketID(){
    return socket.id;
}

socket.once('connect', connected);

setInterval(() => {
    if (socket.connected){
        const start = Date.now();
        
        socket.emit("ping", () => {
            ping = Date.now() - start;
        });
        setPingText(ping);
    }
    else{
        setPingText(-1);
    }
}, 1000);

export default socket;