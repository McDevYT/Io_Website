import { SOCKET_EVENTS, SERVER_IP } from "./constants";
import { updatePlayers, movePlayers, rotatePlayers } from './gameLogic';
import { showPopup, addChatMessage, setPingText } from "./uiHandler";

const socket = io(SERVER_IP);

export let ping: any;
export let id: any;

socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error: string) => {
    showPopup('Failed to connect to server: ' + error);
});

socket.on(SOCKET_EVENTS.ERROR, (error: string) => {
    showPopup('Error: ' + error);
});

socket.on('connect', () => {
    id = socket.id;
});

export function initializeSocketHandlers() {
    socket.on(SOCKET_EVENTS.UPDATE_PLAYERS, updatePlayers);
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, addChatMessage);
    socket.on(SOCKET_EVENTS.MOVE_PLAYERS, movePlayers);
    socket.on(SOCKET_EVENTS.ROTATE_PLAYERS, rotatePlayers);
}

export function leaveGame(){
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

setInterval(() => {
    const start = Date.now();
    
    socket.emit("ping", () => {
        ping = Date.now() - start;
    });
    setPingText(ping);
}, 1000);

export default socket;