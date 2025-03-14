"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = executeCommand;
exports.registerCommand = registerCommand;
const readline_1 = __importDefault(require("readline"));
const index_1 = require("./index");
const constants_1 = require("./constants");
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const commands = new Map();
function executeCommand(commandMessage, sender) {
    const isAdmin = sender === "Console" || index_1.players[sender]?.isAdmin;
    const args = commandMessage.slice(1).split(" "); // Remove "/"
    const commandName = args.shift()?.toLowerCase(); // Extract command & convert to lowercase
    const command = commands.get(commandName || "");
    if (!command) {
        console.log(`[ERROR] Unknown command: /${args[0]}`);
        return;
    }
    if (command.adminOnly && !isAdmin) {
        console.log(`[COMMAND] ${sender} tried executing ${commandMessage}`);
        return;
    }
    try {
        command.execute(args, sender);
    }
    catch (error) {
        console.log(`[ERROR] Error executing command: ${error}`);
    }
}
rl.on("line", (input) => {
    executeCommand(input, "Console");
});
function registerCommand(command) {
    commands.set(command.name, command);
}
registerCommand({
    name: "kick",
    adminOnly: true,
    execute: (args, sender) => {
        if (args.length < 1) {
            console.log("[ERROR] Usage: /kill <username>");
            return;
        }
        console.log(args[0]);
        const player = (0, index_1.getPlayerFromUsername)(args[0] || " ");
        if (!player)
            return;
        console.log(`[INFO] ${sender || "Console"} kicked ${player.username}`);
        (0, index_1.disconnectSocket)(player.id);
    }
});
registerCommand({
    name: "admin",
    adminOnly: true,
    execute: (args, sender) => {
        if (args.length < 1) {
            console.log("[ERROR] Usage: /admin <username>");
            return;
        }
        console.log(args[0]);
        const player = (0, index_1.getPlayerFromUsername)(args[0] || " ");
        if (!player)
            return;
        player.isAdmin = !player.isAdmin;
        console.log(`[INFO] ${sender || "Console"} ${(player.isAdmin) ? "gave" : "removed"} admin to ${player.username}`);
    }
});
registerCommand({
    name: "login",
    adminOnly: false,
    execute: (args, sender) => {
        if (args.length < 1) {
            console.log("[ERROR] Usage: /login <passwort>");
            return;
        }
        console.log(args[0]);
        if (args[0] != constants_1.ADMIN_PW || !sender)
            return;
        index_1.players[sender].isAdmin = true;
        console.log(`[INFO] ${index_1.players[sender].username} logged in as admin`);
    }
});
registerCommand({
    name: "speed",
    adminOnly: true,
    execute: (args, sender) => {
        if (args.length < 1) {
            console.log("[ERROR] Usage: /speed <username> <amount>");
            return;
        }
        console.log(args[0]);
        if (args.length >= 2) {
            const player = (0, index_1.getPlayerFromUsername)(args[0] || " ");
            if (!player)
                return;
            player.speed = parseFloat(args[1]);
            console.log(`[INFO] ${sender || "Console"} set speed of ${player.username}`);
        }
        else {
            if (!index_1.players[sender])
                return;
            index_1.players[sender].speed = parseFloat(args[0]);
            console.log(`[INFO] ${sender || "Console"} set speed of ${index_1.players[sender].username}`);
        }
    }
});
registerCommand({
    name: "alert",
    adminOnly: true,
    execute: (args, sender) => {
        if (args.length < 1) {
            console.log("[ERROR] Usage: /alert <alert>");
            return;
        }
        const alert = args.join(" ");
        if (!alert)
            return;
        (0, index_1.showGameAlert)(alert);
        console.log(`[INFO] ${sender || "Console"} showed alert: ${alert}`);
    }
});
