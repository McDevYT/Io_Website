import * as socket from "./socketHandler";
import * as gameLogic from "./gameLogic";
import {showPopup, hidePopup, fadeIn, fadeOut, switchOverlay} from "./uiHandler";


const chatInput = document.getElementById("chatInput") as HTMLInputElement;
const usernameInput = document.getElementById("usernameInput") as HTMLInputElement;
const escapeMenu = document.getElementById("escapeMenu") as HTMLDivElement;



(async function loadAssets() {
    console.log("Loading Assets");
    
    await gameLogic.initializeGame();

    document.body.appendChild(gameLogic.app.canvas);
    console.log("Finished loading!");

})();

export function addCanvas(canvas: HTMLCanvasElement){
    document.body.appendChild(canvas);
}

function startGame(){
    const username = (usernameInput.value.trim()) ? usernameInput.value : "New Player";
    socket.emitJoinGame(username);
    gameLogic.startGame();
    switchOverlay("gameOverlay");
}

window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    gameLogic.keyChanged(key, true);

    if (key === "escape") {
        if (escapeMenu.style.opacity === '1'){
            fadeOut(escapeMenu);
        }
        else{
            fadeIn(escapeMenu);
        }
    }
});

window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    gameLogic.keyChanged(key, false);
});

usernameInput.addEventListener("input", () =>{
    usernameInput.value = usernameInput.value.replace(" ", "");
})

chatInput.addEventListener("keydown", (event) =>{
    const message = chatInput.value;
    if (event.key == "Enter" && message.trim()){
        event.preventDefault();
        
        socket.emitMessage(message);
        chatInput.value = "";
    }
})

document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

document.getElementById("startGameButton")?.addEventListener("click", () => {
    try {
        startGame();
    }catch (error) {
        showPopup(error as string);
    }
});

document.getElementById("leaveGameButton")?.addEventListener("click", leaveGame);
document.getElementById("resumeGameButton")?.addEventListener("click", () => {fadeOut(escapeMenu)});

document.querySelector("#popUp button")?.addEventListener("click", hidePopup);

function leaveGame(){
    gameLogic.leaveGame();
    socket.disconnectGame();
    switchOverlay("mainMenu");
}