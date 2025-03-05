const socket = io('ws://localhost:3000');

socket.on('message', (text: string) => {

    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul')?.appendChild(el)

});

document.querySelector('button')?.addEventListener('click', () => {
    const text = document.querySelector('input')?.value;
    socket.emit('message', text);
});

console.log("Hello World");