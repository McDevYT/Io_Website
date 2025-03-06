"use strict";
var _a, _b;
const socket = io('http://172.0.0.1:3000');
const counterDisplay = document.getElementById("counterDisplay");
const incrementButton = document.getElementById("incrementButton");
if (incrementButton) {
    incrementButton.addEventListener("click", () => {
        console.log("ButtonClick");
        socket.emit("incrementCounter");
    });
}
socket.on("updateCounter", (newCounter) => {
    if (counterDisplay) {
        counterDisplay.textContent = newCounter.toString();
    }
});
socket.on('message', (text) => {
    var _a;
    const el = document.createElement('li');
    el.innerHTML = text;
    (_a = document.querySelector('ul')) === null || _a === void 0 ? void 0 : _a.appendChild(el);
});
(_a = document.querySelector('button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
    var _a;
    const text = (_a = document.querySelector('input')) === null || _a === void 0 ? void 0 : _a.value;
    socket.emit('message', text);
});
(_b = document.getElementById('usernameButton')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
    var _a;
    const text = (_a = document.getElementById('usernameInput')) === null || _a === void 0 ? void 0 : _a.value.trim();
    if (text)
        socket.emit('newUsername', text);
});
