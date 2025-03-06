const socket = io('http://192.168.56.1:3000');

const counterDisplay = document.getElementById("counterDisplay") as HTMLSpanElement;
const incrementButton = document.getElementById("incrementButton");

if (incrementButton){
    incrementButton.addEventListener("click", () => {
        console.log("ButtonClick");
        socket.emit("incrementCounter");
    });
}

socket.on("updateCounter", (newCounter: number) =>{
    if (counterDisplay){
        counterDisplay.textContent = newCounter.toString();
    }
})

socket.on('message', (text: string) => {

    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul')?.appendChild(el)

});

document.querySelector('button')?.addEventListener('click', () => {
    const text = document.querySelector('input')?.value;
    socket.emit('message', text);
});

document.getElementById('usernameButton')?.addEventListener('click', () => {
    const text = (document.getElementById('usernameInput') as HTMLInputElement)?.value.trim();
    if (text) socket.emit('newUsername', text);
});