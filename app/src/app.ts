const socket = io("http://127.0.0.1:3000");  // Connect to the server

document.getElementById("send")?.addEventListener("click", () => {
    const inputElement = document.getElementById("message") as HTMLInputElement;
    const message = inputElement.value.trim(); // Ensure there's no empty message

    if (message) { // Only emit if the message is not empty
        socket.emit("message", message);
        inputElement.value = ""; // Clear input after sending
    }
});

// Listen for incoming messages from the server
socket.on("message", (msg: string) => {
    const li = document.createElement("li");
    li.textContent = msg;
    document.getElementById("messages")?.appendChild(li);
});
