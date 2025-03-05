"use strict";
var _a;
const socket = io('ws://localhost:3000');
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
console.log("Hello World");
