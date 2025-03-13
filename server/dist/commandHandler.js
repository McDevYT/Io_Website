"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = executeCommand;
exports.registerCommand = registerCommand;
const commands = new Map();
function executeCommand(command, sender, players) {
}
function registerCommand(command) {
    commands.set(command.name, command);
}
