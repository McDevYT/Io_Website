const chatMessages = document.getElementById("chatMessages") as HTMLUListElement;
const pingText = document.getElementById("topBarText") as HTMLParagraphElement;
const gameOverlay = document.getElementById("gameOverlay") as HTMLDivElement;
const escapeMenu = document.getElementById("escapeMenu") as HTMLDivElement;
const mainMenu = document.getElementById("mainMenu") as HTMLDivElement;


export function showPopup(message: string): void {
    const popUp = document.getElementById("popUp") as HTMLElement;
    const popUpText = document.getElementById("popUpText") as HTMLElement;

    popUpText.textContent = message;
    fadeIn(popUp);
}

export function hidePopup(): void {
    const popUp = document.getElementById("popUp") as HTMLElement;
    fadeOut(popUp);
}

export function fadeIn(element: HTMLElement) {
    element.style.opacity = '1';
    element.addEventListener('transitionend', () => {
        element.style.pointerEvents = 'auto';
    }, { once: true });
    element.classList.remove('fade');
}

export function fadeOut(element: HTMLElement) {
    element.style.opacity = '0';
    element.addEventListener('transitionend', () => {
        element.style.pointerEvents = 'none';
    }, { once: true });
    element.classList.add('fade');
}


export function addChatMessage(message: string){
    if (!message.trim()) return;

    const messageElement = document.createElement("li");
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function setPingText(ping: number){
    pingText.textContent = `Ping: ${ping} ms`;
}

export function switchOverlay(overlay?: string){
    fadeOut(mainMenu);
    fadeOut(gameOverlay);
    fadeOut(escapeMenu);

    switch(overlay){
        case "mainMenu":
            fadeIn(mainMenu);
            break;
        case "gameOverlay":
            fadeIn(gameOverlay);
    }
}
