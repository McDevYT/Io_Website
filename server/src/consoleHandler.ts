import readline from "readline";
import {  Command, CommandHandler } from "./types";
import {  players, getIdFromUsername, getPlayerFromUsername, disconnectSocket, showGameAlert } from "./index";
import { ADMIN_PW } from "./constants";

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


    try{
        command.execute(args, sender);
    }
    catch (error){
        console.log(`[ERROR] Error executing command: ${error}`);
    }
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
        player.isAdmin = !player.isAdmin;
        console.log(`[INFO] ${sender || "Console"} ${(player.isAdmin) ? "gave" : "removed"} admin to ${player.username}`);
    }
});

registerCommand({
    name: "login",
    adminOnly: false,
    execute: (args, sender) =>{
        if (args.length < 1) {
            console.log("[ERROR] Usage: /login <passwort>");
            return;
        }
        console.log(args[0]);

        if(args[0] != ADMIN_PW || !sender) return;

        players[sender].isAdmin = true;
        console.log(`[INFO] ${players[sender].username} logged in as admin`);
    }
});

registerCommand({
    name: "speed",
    adminOnly: true,
    execute: (args, sender) =>{
        if (args.length < 1) {
            console.log("[ERROR] Usage: /speed <username> <amount>");
            return;
        }
        console.log(args[0]);

        if (args.length >= 2){
            const player = getPlayerFromUsername(args[0] || " ");
            if(!player) return;
            player.speed = parseFloat(args[1]);
            console.log(`[INFO] ${sender || "Console"} set speed of ${player.username}`);
        }
        else{
            if (!players[sender]) return;
            players[sender].speed = parseFloat(args[0]);
            console.log(`[INFO] ${sender || "Console"} set speed of ${players[sender].username}`);
        }
    }
});

registerCommand({
    name: "alert",
    adminOnly: true,
    execute: (args, sender) =>{
        if (args.length < 1) {
            console.log("[ERROR] Usage: /alert <alert>");
            return;
        }

        const alert = args.join(" ");
        if(!alert) return;
        showGameAlert(alert);
        console.log(`[INFO] ${sender || "Console"} showed alert: ${alert}`);
    }
});