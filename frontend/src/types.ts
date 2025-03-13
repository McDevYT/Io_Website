export interface Player {
    id: string;
    x: number;
    y: number;
    rotation: number;
    texture: string;
    username: string;
    speed: number;
    keys: Record<string, boolean>;
}
