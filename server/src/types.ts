export interface Player {
    id: string;
    x: number;
    y: number;
    rotation: number;
    texture: string;
    username: string;
    speed: number;
    health: number;
    keys: Record<string, boolean>;
    isAdmin: boolean;
}

export type CommandHandler = (args: string[], sender: string) => void;
export interface Command {
    name: string;
    execute: CommandHandler;
    adminOnly?: boolean;
}