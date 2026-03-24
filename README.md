# ChessMaster

A beautiful, modern chess game with WebSocket multiplayer support and automatic timeout functionality.

## Features

- **Beautiful UI**: Modern, responsive design with gradient themes
- **Real-time Multiplayer**: WebSocket-based gameplay
- **Automatic Timeout**: 2-minute timeout for inactive players
- **Player Disconnection**: Automatic win when opponent disconnects
- **Docker Support**: Complete Docker Compose setup with PostgreSQL

## Quick Start

### Using Docker (Development)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chessmaster
   ```

2. **Start the application**
   ```bash
   docker compose up -d --build
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend WebSocket: ws://localhost:8080

4. **Stop the application**
   ```bash
   docker compose down
   ```

### Proper Production Deployment

This repo includes a production stack in `docker-compose.prod.yml`:

- Frontend is built with Vite and served by Nginx
- WebSocket traffic is reverse-proxied through `/ws`
- Backend is internal (not exposed publicly)
- Only port `80` is published

1. **Create production env file**
   ```bash
   cp .env.example .env
   ```

2. **Edit credentials in `.env`**
   ```env
   POSTGRES_DB=chessgame
   POSTGRES_USER=chessuser
   POSTGRES_PASSWORD=change_this_password
   ```

3. **Build and run production**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env up -d --build
   ```

4. **Open the app**
   - Frontend + API/WebSocket: http://YOUR_SERVER_IP/

5. **View logs**
   ```bash
   docker compose -f docker-compose.prod.yml logs -f
   ```

6. **Stop production stack**
   ```bash
   docker compose -f docker-compose.prod.yml down
   ```

### Manual Setup

1. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Start the backend**
   ```bash
   cd backend && npm run dev
   ```

3. **Start the frontend**
   ```bash
   cd frontend && npm start
   ```

## Game Rules

- **Timeout**: If a player doesn't make a move for 2 minutes, they lose
- **Disconnection**: If a player disconnects, their opponent wins
- **Standard Chess Rules**: All standard chess rules apply

## Project Structure

```
chessmaster/
├── backend/           # WebSocket server
│   ├── src/
│   │   ├── Game.ts    # Game logic with timeout
│   │   ├── Gamemanager.ts
│   │   └── index.ts
│   └── Dockerfile
├── frontend/          # React application
│   ├── src/
│   │   ├── screen/
│   │   │   ├── Game.tsx
│   │   │   └── Landing.tsx
│   │   └── component/
│   │       └── ChessBoard.tsx
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Docker Services

- **postgres**: PostgreSQL database (port 5432)
- **backend**: Node.js WebSocket server (port 8080)
- **frontend**: React application (port 3000)

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development/production)

### Frontend
- `VITE_WS_URL`: WebSocket endpoint (production uses `/ws`)

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with TypeScript compilation
```

### Frontend Development
```bash
cd frontend
npm start    # Starts development server
```

## Production Build

```bash
# Build both services
docker compose build

# Start in production mode
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8080, and 5432 are available
2. **Docker permissions**: Make sure Docker is running and you have permissions
3. **Network issues**: Check firewall settings for WebSocket connections

### Logs

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs frontend
```

## License

MIT License
