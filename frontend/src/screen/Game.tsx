import { useEffect, useRef, useState } from 'react'
import ChessBoard from './component/ChessBoard'
import useSocket from '../hooks/useSocket'
import { Chess } from 'chess.js'

export const INIT_GAME = 'init_game'
export const MOVE = 'move'
export const GAME_OVER = 'game_over'
export const WAITING = 'waiting'
export const ERROR = 'error'

function Game() {
  const { socket, connected, send } = useSocket();
  const chessRef = useRef(new Chess());
  const hasAutoQueuedRef = useRef(false);
  const [moves, setMoves] = useState<any[]>([]);
  const [started, setStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [myColor, setMyColor] = useState<'white'|'black'|null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);
  const [pendingInitRequest, setPendingInitRequest] = useState(false);

  useEffect(() => {
    const ws = socket;
    if (!ws) return;

    ws.onmessage = (ev) => {
      try {
        const message = JSON.parse(ev.data);
        
        switch (message.type) {
          case WAITING:
            setWaiting(true);
            setStarted(false);
            setMyColor(null);
            break;
            
          case INIT_GAME:
            setStarted(true);
            setWaiting(false);
            setMyColor(message.payload?.colour || null);
            if (message.payload?.fen) {
              try {
                chessRef.current.load(message.payload.fen);
                setMoves([]);
              } catch (e) {
                console.warn('Failed to load FEN from server', message.payload.fen);
              }
            }
            break;
            
          case MOVE:
            const mv = message.payload?.move;
            const fen = message.payload?.fen;
            if (mv) {
              try {
                chessRef.current.move(mv);
                setMoves((m) => [...m, mv]);
                if (fen) {
                  try {
                    chessRef.current.load(fen);
                  } catch (e) {
                    console.warn('Failed to load FEN from server', fen);
                  }
                }
              } catch (e) {
                console.warn('Invalid move from server', mv);
              }
            }
            break;
            
          case GAME_OVER:
            setStarted(false);
            setGameOver(true);
            setWinner(message.payload?.winner || null);
            setGameOverReason(message.payload?.reason || 'Game over');
            break;
            
          case ERROR:
            console.error('Server error:', message.payload?.message);
            alert('Error: ' + message.payload?.message);
            break;
            
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (e) {
        console.error('Message parse error:', e);
      }
    };
    return () => {
      if (ws.onmessage) {
        ws.onmessage = null;
      }
    };
  }, [socket]);

  useEffect(() => {
    if (!connected || !pendingInitRequest) {
      return;
    }

    send({ type: INIT_GAME });
    setPendingInitRequest(false);
  }, [connected, pendingInitRequest, send]);

  useEffect(() => {
    if (!connected || hasAutoQueuedRef.current || started || waiting || gameOver) {
      return;
    }

    // Auto-queue user once on first connect so multiple tabs pair immediately.
    send({ type: INIT_GAME });
    setWaiting(true);
    hasAutoQueuedRef.current = true;
  }, [connected, started, waiting, gameOver, send]);

  const handlePlay = () => {
    hasAutoQueuedRef.current = true;
    setWaiting(false);
    setStarted(false);
    setGameOver(false);
    setWinner(null);
    setGameOverReason(null);
    setMoves([]);
    setMyColor(null);
    
    chessRef.current.reset();
    
    if (connected) {
      send({ type: INIT_GAME });
      setPendingInitRequest(false);
    } else {
      setPendingInitRequest(true);
      setWaiting(true);
    }
  };

  const handleMakeMove = (from: string, to: string) => {
    if (!started || gameOver) {
      return;
    }
    
    try {
      const move = { from, to };
      const result = chessRef.current.move(move);
      
      if (!result) {
        console.warn('Invalid local move', from, to);
        return;
      }
      
      setMoves((m) => [...m, move as any]);
      
      send({ 
        type: MOVE, 
        payload: { 
          move: { from, to } 
        } 
      });
      
    } catch (e) {
      console.warn('Invalid local move', from, to);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 mb-4'>
            Chess Master
          </h1>
          <div className='flex justify-center space-x-4'>
            <div className={`px-6 py-2 rounded-full font-bold ${connected ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
              WebSocket: {connected ? 'Connected' : 'Connecting...'}
            </div>
            <div className={`px-6 py-2 rounded-full font-bold ${myColor === 'white' ? 'bg-white text-gray-800' : myColor === 'black' ? 'bg-gray-800 text-amber-300' : 'bg-gray-600 text-gray-300'}`}>
              You are: {myColor || 'Waiting...'}
            </div>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row gap-8 items-start justify-center'>
          <div className='bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20'>
            <ChessBoard 
              fen={chessRef.current.fen()} 
              onMakeMove={handleMakeMove} 
              myColor={myColor} 
              started={started} 
              gameOver={gameOver}
              gameOverReason={gameOverReason}
            />
          </div>

          <div className='space-y-6 w-full lg:w-80'>
            <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20'>
              <h3 className='font-semibold mb-4 text-lg text-amber-100 flex items-center'>
                <span className='mr-2'>📜</span> Move History
              </h3>
              {moves.length > 0 ? (
                <div className='grid grid-cols-2 gap-1 max-h-32 overflow-y-auto'>
                  {moves.slice(-8).map((m, i) => (
                    <div key={i} className='flex items-center justify-between bg-black/30 rounded-lg p-1 text-xs'>
                      <span className='text-gray-300'>{Math.floor(i/2) + 1}.</span>
                      <div className='flex items-center space-x-1'>
                        <span className='text-amber-200 font-mono'>{m.from}</span>
                        <span className='text-gray-400'>→</span>
                        <span className='text-amber-200 font-mono'>{m.to}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-gray-400 text-sm text-center py-2'>No moves yet</p>
              )}
            </div>

            <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20'>
              <h3 className='font-semibold mb-4 text-lg text-amber-100 flex items-center'>
                <span className='mr-2'>🎮</span> Game Status
              </h3>
              <div className='space-y-3'>
                <div className='bg-black/30 rounded-lg p-3'>
                  <span className='text-gray-300'>Status:</span>
                  <span className='ml-2 font-medium'>
                    {gameOver ? 'Game Over' : waiting ? 'Waiting for opponent...' : started ? 'In Progress' : 'Not started'}
                  </span>
                </div>
                <div className='bg-black/30 rounded-lg p-3'>
                  <span className='text-gray-300'>Color:</span>
                  <span className='ml-2 font-medium'>{myColor ?? '—'}</span>
                </div>
                {gameOver && (
                  <div className='space-y-2'>
                    <div className='bg-black/30 rounded-lg p-3'>
                      <span className='text-gray-300'>Winner:</span>
                      <span className='ml-2 font-medium'>{winner || 'Unknown'}</span>
                    </div>
                    <div className='bg-black/30 rounded-lg p-3'>
                      <span className='text-gray-300'>Reason:</span>
                      <span className='ml-2 font-medium'>{gameOverReason || 'Game ended'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20'>
              <h3 className='font-semibold mb-4 text-lg text-amber-100 flex items-center'>
                <span className='mr-2'>🎮</span> Controls
              </h3>
              <div className='space-y-4'>
                {!started && !waiting && !gameOver && (
                  <button 
                    onClick={handlePlay} 
                    className='w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105'
                  >
                    🎯 Start Game
                  </button>
                )}
                {waiting && (
                  <div className='text-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-2'></div>
                    <div className='text-amber-200 font-medium'>Waiting for opponent...</div>
                  </div>
                )}
                {gameOver && (
                  <button 
                    onClick={handlePlay} 
                    className='w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105'
                  >
                    🔄 Play Again
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Game
