"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const socket = (0, socket_io_client_1.default)();
(_a = document.getElementById("send")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    const inputElement = document.getElementById("message");
    const message = inputElement.value;
    socket.emit("message", message);
});
socket.on("message", (msg) => {
    var _a;
    const li = document.createElement("li");
    li.textContent = msg;
    (_a = document.getElementById("messages")) === null || _a === void 0 ? void 0 : _a.appendChild(li);
});
