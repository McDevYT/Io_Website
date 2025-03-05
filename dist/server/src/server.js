import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
const app = express();
const server = createServer(app);
// Allow cross-origin requests from the front-end server's origin
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500", // Adjust this if necessary
        methods: ["GET", "POST"],
    },
});
io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("message", (msg) => {
        console.log("Message: ", msg);
        io.emit("message", msg);
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});
server.listen(3000, () => {
    console.log("Server running on port 3000");
});
