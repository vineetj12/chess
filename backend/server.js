const { WebSocketServer } = require("ws");
const { Gamemanager } = require("./dist/index.js");

const wss = new WebSocketServer({ port: 8081 });
const gamemanager = new Gamemanager();

wss.on('connection', function connection(socket) {
    gamemanager.addUser(socket);
    
    socket.on('close', (code, reason) => {
        gamemanager.removeUser(socket);
    });
    
    socket.on('error', (err) => {
        gamemanager.removeUser(socket);
    });
});

console.log('WebSocket server listening on ws://localhost:8081');
