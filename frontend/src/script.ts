import { Application } from "pixi.js";
const socket = io('http://localhost:3000');

interface Player {
    id: string;
    x: number;
    y: number;
    color: string;
    username: string;
    speed: number;
}

(async () =>{
    const app = new Application();

    await app.init({ background: '#1099bb', resizeTo: window });
    document.body.appendChild(app.canvas);

    
})();