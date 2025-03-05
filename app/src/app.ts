import io from "socket.io-client";

const socket = io();

document.getElementById("send")?.addEventListener("click", () => {
    const inputElement = document.getElementById("message") as HTMLInputElement;
    const message = inputElement.value;
    socket.emit("message", message);
});

socket.on("message", (msg: string) => {
    const li = document.createElement("li");
    li.textContent = msg;
    document.getElementById("messages")?.appendChild(li);
});
