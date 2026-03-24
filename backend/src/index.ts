import { WebSocketServer } from "ws";
import { Gamemanager } from "./Gamemanager";

const PORT = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port: PORT });
const gamemanager = new Gamemanager();

wss.on('connection', function connection(socket) {
    console.log('New WebSocket connection established');
    gamemanager.addUser(socket);
    
    socket.on('close', (code, reason) => {
        console.log('WebSocket connection closed:', code, reason.toString());
        gamemanager.removeUser(socket);
    });
    
    socket.on('error', (err) => {
        console.error('WebSocket error:', err);
        gamemanager.removeUser(socket);
    });
});

console.log(`WebSocket server listening on ws://localhost:${PORT}`);
console.log('Make sure the frontend is connecting to the correct port');
