const chatMessages = document.getElementById("chatMessages") as HTMLUListElement;
const pingText = document.getElementById("topBarText") as HTMLParagraphElement;

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
    element.classList.remove('fade');
    element.style.pointerEvents = 'auto';
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