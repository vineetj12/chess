const WebSocket = require('ws');

const INIT_GAME = 'init_game';
const MOVE = 'move';
const WAITING = 'waiting';
const GAME_OVER = 'game_over';

console.log('Starting matchmaking test...\n');

let player1Ready = false;
let player2Ready = false;

// Player 1
const ws1 = new WebSocket('ws://localhost:8080');

ws1.on('open', () => {
  console.log('[Player 1] Connected to server');
  player1Ready = true;
  
  // Wait a bit then send INIT_GAME
  setTimeout(() => {
    console.log('[Player 1] Sending INIT_GAME...');
    ws1.send(JSON.stringify({ type: INIT_GAME }));
  }, 500);
});

ws1.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('[Player 1] Received:', message.type, message.payload ? `(${JSON.stringify(message.payload)})` : '');
    
    if (message.type === GAME_OVER) {
      console.log('[Player 1] Game Over!', message.payload);
    }
  } catch (e) {
    console.log('[Player 1] Error parsing message:', e.message);
  }
});

ws1.on('error', (err) => {
  console.log('[Player 1] Error:', err.message);
});

ws1.on('close', () => {
  console.log('[Player 1] Disconnected');
});

// Player 2 - Connect after Player 1 is ready
setTimeout(() => {
  const ws2 = new WebSocket('ws://localhost:8080');
  
  ws2.on('open', () => {
    console.log('[Player 2] Connected to server');
    player2Ready = true;
    
    // Wait a bit then send INIT_GAME
    setTimeout(() => {
      console.log('[Player 2] Sending INIT_GAME...');
      ws2.send(JSON.stringify({ type: INIT_GAME }));
    }, 500);
  });

  ws2.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('[Player 2] Received:', message.type, message.payload ? `(${JSON.stringify(message.payload)})` : '');
      
      if (message.type === GAME_OVER) {
        console.log('[Player 2] Game Over!', message.payload);
      }
    } catch (e) {
      console.log('[Player 2] Error parsing message:', e.message);
    }
  });

  ws2.on('error', (err) => {
    console.log('[Player 2] Error:', err.message);
  });

  ws2.on('close', () => {
    console.log('[Player 2] Disconnected');
  });

  // Close both after 10 seconds
  setTimeout(() => {
    console.log('\n[Test] Closing connections after 10 seconds...');
    ws1.close();
    ws2.close();
  }, 10000);
}, 1000);
