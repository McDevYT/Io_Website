import readline from "readline";
import {  Command, CommandHandler } from "./types";
import {  players, getIdFromUsername, getPlayerFromUsername, disconnectSocket } from "./index";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const commands = new Map<string, Command>();

export function executeCommand(commandMessage: string, sender: string){

    const isAdmin = sender === "Console" || players[sender]?.isAdmin;

    const args = commandMessage.slice(1).split(" ");  // Remove "/"
    const commandName = args.shift()?.toLowerCase(); // Extract command & convert to lowercase
    const command = commands.get(commandName || "");

    if (!command){
        console.log(`[ERROR] Unknown command: /${args[0]}`); return;
    }    
    if (command.adminOnly && !isAdmin){
        console.log(`[COMMAND] ${sender} tried executing ${commandMessage}`);
        return;
    }

    command.execute(args, sender);
}

rl.on("line", (input) =>{
    executeCommand(input, "Console");
});

export function registerCommand(command: Command) {
    commands.set(command.name, command);
}

registerCommand({
    name: "kick",
    adminOnly: true,
    execute: (args, sender) =>{
        if (args.length < 1) {
            console.log("[ERROR] Usage: /kill <username>");
            return;
        }
        console.log(args[0]);

        const player = getPlayerFromUsername(args[0] || " ");
        if(!player) return;
        console.log(`[INFO] ${sender || "Console"} kicked ${player.username}`);
        disconnectSocket(player.id);
        
    }
});

registerCommand({
    name: "admin",
    adminOnly: true,
    execute: (args, sender) =>{
        if (args.length < 1) {
            console.log("[ERROR] Usage: /admin <username>");
            return;
        }
        console.log(args[0]);

        const player = getPlayerFromUsername(args[0] || " ");
        if(!player) return;
        console.log(`[INFO] ${sender || "Console"} made ${player.username} an admin`);
        player.isAdmin = true;
        
    }
});

