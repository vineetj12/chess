const { WebSocketServer } = require("ws");

class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = this.createInitialBoard();
        this.currentTurn = 'white';
        this.gameOver = false;
        
        this.sendToPlayer(player1, {
            type: 'init_game',
            payload: {
                colour: 'white',
                fen: this.getFEN()
            }
        });
        
        this.sendToPlayer(player2, {
            type: 'init_game',
            payload: {
                colour: 'black',
                fen: this.getFEN()
            }
        });
    }
    
    createInitialBoard() {
        return [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];
    }
    
    getFEN() {
        return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
    
    sendToPlayer(player, message) {
        if (player.readyState === 1) {
            player.send(JSON.stringify(message));
        }
    }
    
    makeMove(socket, move) {
        const from = move.from;
        const to = move.to;
        
        const isPlayer1 = socket === this.player1;
        const isWhiteTurn = this.currentTurn === 'white';
        
        if ((isPlayer1 && !isWhiteTurn) || (!isPlayer1 && isWhiteTurn)) {
            this.sendToPlayer(socket, {
                type: 'error',
                payload: { message: 'Not your turn' }
            });
            return;
        }
        
        this.sendToPlayer(socket === this.player1 ? this.player2 : this.player1, {
            type: 'move',
            payload: {
                move: move,
                fen: this.getFEN()
            }
        });
        
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    }
}

class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    
    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
        this.games = this.games.filter(game => 
            game.player1 !== socket && game.player2 !== socket
        );
    }
    
    addHandler(socket) {
        socket.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                
                switch (message.type) {
                    case 'init_game':
                        this.handleInitGame(socket);
                        break;
                    case 'move':
                        this.handleMove(socket, message.payload?.move);
                        break;
                    default:
                }
            } catch (error) {
            }
        });
    }
    
    handleInitGame(socket) {
        if (this.pendingUser) {
            const game = new Game(this.pendingUser, socket);
            this.games.push(game);
            this.pendingUser = null;
        } else {
            this.pendingUser = socket;
            socket.send(JSON.stringify({
                type: 'waiting',
                payload: { message: 'Waiting for opponent...' }
            }));
        }
    }
    
    handleMove(socket, move) {
        const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
        if (!game) {
            socket.send(JSON.stringify({
                type: 'error',
                payload: { message: 'No active game found' }
            }));
            return;
        }
        
        try {
            game.makeMove(socket, move);
        } catch (error) {
            socket.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Failed to make move' }
            }));
        }
    }
}

const wss = new WebSocketServer({ port: 8081 });
const gamemanager = new GameManager();

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
