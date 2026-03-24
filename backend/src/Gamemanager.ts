import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE, WAITING } from "./message";

export class Gamemanager {
    private games: Game[] = [];
    private pendingUser: WebSocket | null = null;
    private users: WebSocket[] = [];

    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];

        setInterval(() => {
            this.handleGameState();
        }, 100);
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);

        socket.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === INIT_GAME) {
                    this.handleInitGame(socket);
                } else if (message.type === MOVE) {
                    this.handleMove(socket, message.payload.move);
                }
            } catch (e) {
                console.log(e);
            }
        });
    }

    removeUser(socket: WebSocket) {
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

    private handleGameState() {
        if (this.pendingUser) {
            return;
        } else {
        }
    }

    private handleInitGame(socket: WebSocket) {
        console.log(`[DEBUG] INIT_GAME received. Pending users: ${this.pendingUser ? 1 : 0}, Active games: ${this.games.length}`);
        
        const existingGame = this.games.find(game => game.player1 === socket || game.player2 === socket);
        if (existingGame) {
            console.log('[DEBUG] Player already in a game, ignoring INIT_GAME');
            return;
        }

        if (this.pendingUser && this.pendingUser !== socket) {
            const waitingPlayer = this.pendingUser;
            this.pendingUser = null;

            const game = new Game(waitingPlayer, socket);
            this.games.push(game);
            console.log(`[DEBUG] Game created! Player 1 & Player 2 paired. Total games: ${this.games.length}`);
        } else {
            this.pendingUser = socket;
            console.log(`[DEBUG] Player queued in pending state. Total pending: 1`);
            socket.send(JSON.stringify({
                type: WAITING
            }));
        }
    }

    private handleMove(socket: WebSocket, move: { from: string; to: string }) {
        const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
        if (game) {
            game.makemove(socket, move);
        }
    }
}
