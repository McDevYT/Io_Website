"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = executeCommand;
exports.registerCommand = registerCommand;
const readline_1 = __importDefault(require("readline"));
const index_1 = require("./index");
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
    command.execute(args, sender);
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
        console.log(`[INFO] ${sender || "Console"} made ${player.username} an admin`);
        player.isAdmin = true;
    }
});
