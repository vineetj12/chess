"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gamemanager = void 0;
const Game_1 = require("./Game");
const message_1 = require("./message");
class Gamemanager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
        this.games = [];
        this.pendingUser = null;
        this.users = [];
        setInterval(() => {
            this.handleGameState();
        }, 100);
    }
    addUser(socket) {
        this.users.push(socket);
        socket.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === message_1.INIT_GAME) {
                    this.handleInitGame(socket);
                }
                else if (message.type === message_1.MOVE) {
                    this.handleMove(socket, message.payload.move);
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
        if (this.pendingUser === socket) {
            this.pendingUser = null;
        }
        const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
        if (game) {
            game.disconnectPlayer(socket);
            this.games = this.games.filter(g => g !== game);
        }
    }
    handleGameState() {
        if (this.pendingUser) {
            return;
        }
        else {
        }
    }
    handleInitGame(socket) {
        console.log(`[DEBUG] INIT_GAME received. Pending users: ${this.pendingUser ? 1 : 0}, Active games: ${this.games.length}`);
        const existingGame = this.games.find(game => game.player1 === socket || game.player2 === socket);
        if (existingGame) {
            console.log('[DEBUG] Player already in a game, ignoring INIT_GAME');
            return;
        }
        if (this.pendingUser && this.pendingUser !== socket) {
            const waitingPlayer = this.pendingUser;
            this.pendingUser = null;
            const game = new Game_1.Game(waitingPlayer, socket);
            this.games.push(game);
            console.log(`[DEBUG] Game created! Player 1 & Player 2 paired. Total games: ${this.games.length}`);
        }
        else {
            this.pendingUser = socket;
            console.log(`[DEBUG] Player queued in pending state. Total pending: 1`);
            socket.send(JSON.stringify({
                type: message_1.WAITING
            }));
        }
    }
    handleMove(socket, move) {
        const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
        if (game) {
            game.makemove(socket, move);
        }
    }
}
exports.Gamemanager = Gamemanager;
