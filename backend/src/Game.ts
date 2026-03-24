import { WebSocket } from "ws";
import { Chess} from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./message";
export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private count = 0;
    private startTime: Date;
    private lastMoveTime: Date;
    private timeoutTimer: NodeJS.Timeout | null = null;
    private readonly TIMEOUT_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
    
    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.lastMoveTime = new Date();
        
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                colour: "white",
                fen: this.board.fen()
            }
        }));
        
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                colour: "black",
                fen: this.board.fen()
            }
        }));
        
        this.startTimeoutTimer();
    }
    
    makemove(socket: WebSocket, move: { from: string; to: string }): { error?: string } | void {
        const isPlayer1Turn = this.count % 2 === 0;
        const isPlayer1 = socket === this.player1;
        
        if ((isPlayer1Turn && !isPlayer1) || (!isPlayer1Turn && isPlayer1)) {
            return { error: "Not your turn" };
        }
        
        try {
            const result = this.board.move(move);
            if (!result) {
                return { error: "Invalid move" };
            }
            
            this.lastMoveTime = new Date();
            this.resetTimeoutTimer();
            
            if (this.board.isGameOver()) {
                const winner = this.board.turn() === 'w' ? "black" : "white";
                const gameOverMessage = {
                    type: GAME_OVER,
                    payload: {
                        winner,
                        reason: this.getGameOverReason(),
                        fen: this.board.fen()
                    }
                };
                
                this.player1.send(JSON.stringify(gameOverMessage));
                this.player2.send(JSON.stringify(gameOverMessage));
                this.clearTimeoutTimer();
                return;
            }
            
            const opponent = isPlayer1 ? this.player2 : this.player1;
            opponent.send(JSON.stringify({
                type: MOVE,
                payload: {
                    move,
                    fen: this.board.fen()
                }
            }));
            
            this.count++;
            return;
            
        } catch (error) {
            return { error: "Invalid move" };
        }
    }
    
    private getGameOverReason(): string {
        if (this.board.isCheckmate()) return "Checkmate";
        if (this.board.isStalemate()) return "Stalemate";
        if (this.board.isDraw()) return "Draw";
        if (this.board.isThreefoldRepetition()) return "Threefold repetition";
        if (this.board.isInsufficientMaterial()) return "Insufficient material";
        return "Game over";
    }
    
    private startTimeoutTimer(): void {
        this.clearTimeoutTimer();
        this.timeoutTimer = setInterval(() => {
            const timeSinceLastMove = Date.now() - this.lastMoveTime.getTime();
            if (timeSinceLastMove >= this.TIMEOUT_DURATION) {
                this.handleTimeout();
            }
        }, 1000);
    }
    
    private resetTimeoutTimer(): void {
        this.clearTimeoutTimer();
        this.startTimeoutTimer();
    }
    
    private clearTimeoutTimer(): void {
        if (this.timeoutTimer) {
            clearInterval(this.timeoutTimer);
            this.timeoutTimer = null;
        }
    }
    
    private handleTimeout(): void {
        this.clearTimeoutTimer();
        const isPlayer1Turn = this.count % 2 === 0;
        const winner = isPlayer1Turn ? "black" : "white";
        const reason = "Timeout";
        
        const timeoutMessage = {
            type: GAME_OVER,
            payload: {
                winner,
                reason,
                fen: this.board.fen()
            }
        };
        
        this.player1.send(JSON.stringify(timeoutMessage));
        this.player2.send(JSON.stringify(timeoutMessage));
    }
    
    public disconnectPlayer(socket: WebSocket): void {
        this.clearTimeoutTimer();
        const isPlayer1 = socket === this.player1;
        const winner = isPlayer1 ? "black" : "white";
        const reason = "Opponent disconnected";
        
        const disconnectMessage = {
            type: GAME_OVER,
            payload: {
                winner,
                reason,
                fen: this.board.fen()
            }
        };
        
        if (isPlayer1 && this.player2.readyState === WebSocket.OPEN) {
            this.player2.send(JSON.stringify(disconnectMessage));
        } else if (!isPlayer1 && this.player1.readyState === WebSocket.OPEN) {
            this.player1.send(JSON.stringify(disconnectMessage));
        }
    }
}
