import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

interface ChessBoardProps {
  fen: string;
  onMakeMove: (from: string, to: string) => void;
  myColor: string | null;
  started: boolean;
  gameOver?: boolean;
  gameOverReason?: string | null;
}

const getValidMoves = (fen: string, fromSquare: string): string[] => {
  try {
    const chess = new Chess(fen);
    const moves = chess.moves({ square: fromSquare as any, verbose: true });
    return moves.map((move: any) => move.to);
  } catch (e) {
    console.warn('Error calculating valid moves:', e);
    return [];
  }
};

const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  onMakeMove,
  myColor,
  started,
  gameOver = false,
  gameOverReason = null
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [board, setBoard] = useState<string[][]>([]);

  useEffect(() => {
    const parseFen = (fen: string) => {
      const boardArray: string[][] = Array(8).fill(null).map(() => Array(8).fill(''));
      const [piecePlacement] = fen.split(' ');
      const rows = piecePlacement.split('/');
      
      for (let row = 0; row < 8; row++) {
        let col = 0;
        for (const char of rows[row]) {
          if (isNaN(parseInt(char))) {
            boardArray[row][col] = char;
            col++;
          } else {
            col += parseInt(char);
          }
        }
      }
      setBoard(boardArray);
    };
    
    parseFen(fen);
  }, [fen]);

  const getPieceSymbol = (piece: string): string => {
    if (!piece) return '';
    
    const symbols: { [key: string]: string } = {
      'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
      'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
    };
    
    return symbols[piece] || '';
  };

  const getPieceColor = (piece: string): string => {
    if (!piece) return '';
    return piece === piece.toLowerCase() ? 'text-slate-900' : 'text-slate-50';
  };

  const getPieceStyle = (piece: string): React.CSSProperties => {
    const isBlackPiece = piece === piece.toLowerCase();
    return {
      userSelect: 'none',
      textShadow: isBlackPiece
        ? '0 1px 2px rgba(255,255,255,0.45)'
        : '0 1px 2px rgba(0,0,0,0.65)',
      WebkitTextStroke: isBlackPiece ? '0.6px rgba(255,255,255,0.35)' : '0.6px rgba(0,0,0,0.45)',
    };
  };

  const isLightSquare = (row: number, col: number): boolean => {
    return (row + col) % 2 === 0;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!started || gameOver) return;

    const file = String.fromCharCode(97 + col);
    const rank = 8 - row;
    const square = `${file}${rank}`;

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      if (validMoves.includes(square)) {
        onMakeMove(selectedSquare, square);
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        const piece = board[row][col];
        if (piece && ((myColor === 'white' && piece === piece.toUpperCase()) || 
                     (myColor === 'black' && piece === piece.toLowerCase()))) {
          setSelectedSquare(square);
          const validMovesForPiece = getValidMoves(fen, square);
          setValidMoves(validMovesForPiece);
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      const piece = board[row][col];
      if (piece && ((myColor === 'white' && piece === piece.toUpperCase()) || 
                   (myColor === 'black' && piece === piece.toLowerCase()))) {
        setSelectedSquare(square);
        const validMovesForPiece = getValidMoves(fen, square);
        setValidMoves(validMovesForPiece);
      }
    }
  };

  const isSquareSelected = (row: number, col: number): boolean => {
    if (!selectedSquare) return false;
    const file = String.fromCharCode(97 + col);
    const rank = 8 - row;
    return selectedSquare === `${file}${rank}`;
  };

  const isValidMove = (row: number, col: number): boolean => {
    if (!validMoves.length) return false;
    const file = String.fromCharCode(97 + col);
    const rank = 8 - row;
    return validMoves.includes(`${file}${rank}`);
  };

  return (
    <div className="w-full">
      {gameOver && (
        <div className="p-4 mb-4 bg-gradient-to-r from-red-900/70 to-red-800/70 border border-red-600 rounded-xl shadow-lg text-center">
          <h3 className="text-xl font-bold text-red-200 mb-1">Game Over</h3>
          <p className="text-red-100 text-sm">{gameOverReason || 'The game has ended'}</p>
        </div>
      )}

      {!started && !gameOver && (
        <div className="text-gray-300 mb-4 text-center">Waiting to start game...</div>
      )}

      <div className="border-8 border-slate-700 rounded-2xl shadow-2xl bg-gradient-to-br from-amber-100 to-amber-200 p-3 md:p-4">
        <div className="grid grid-cols-8 mx-auto w-[min(90vw,640px)] aspect-square">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isLight = isLightSquare(rowIndex, colIndex);
              const isSelected = isSquareSelected(rowIndex, colIndex);
              const isValid = isValidMove(rowIndex, colIndex);

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    relative flex items-center justify-center cursor-pointer aspect-square
                    ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                    ${isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''}
                    ${isValid ? 'ring-2 ring-green-500 ring-inset bg-green-200' : ''}
                    hover:brightness-110 transition-all duration-200
                  `}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece && (
                    <span
                      className={`select-none ${getPieceColor(piece)} text-[clamp(24px,4.8vw,46px)] leading-none`}
                      style={getPieceStyle(piece)}
                    >
                      {getPieceSymbol(piece)}
                    </span>
                  )}
                  {isValid && (
                    <div className="absolute w-4 h-4 md:w-6 md:h-6 bg-green-500/55 rounded-full"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
