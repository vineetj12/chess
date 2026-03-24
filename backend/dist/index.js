"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const Gamemanager_1 = require("./Gamemanager");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const gamemanager = new Gamemanager_1.Gamemanager();
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
console.log('WebSocket server listening on ws://localhost:8080');
console.log('Make sure the frontend is connecting to the correct port');
