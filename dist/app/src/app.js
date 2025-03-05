"use strict";
var _a;
const socket = io("http://127.0.0.1:3000"); // Connect to the server
(_a = document.getElementById("send")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    const inputElement = document.getElementById("message");
    const message = inputElement.value.trim(); // Ensure there's no empty message
    if (message) { // Only emit if the message is not empty
        socket.emit("message", message);
        inputElement.value = ""; // Clear input after sending
    }
});
// Listen for incoming messages from the server
socket.on("message", (msg) => {
    var _a;
    const li = document.createElement("li");
    li.textContent = msg;
    (_a = document.getElementById("messages")) === null || _a === void 0 ? void 0 : _a.appendChild(li);
});
