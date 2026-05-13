import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupWebSocket } from './websocket/websocketHandler.js';
import chatRoutes from './controllers/chatController.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(logger);

// Routes
app.use('/api/chat', chatRoutes);

// Serve the main chat page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use(errorHandler);

// Setup WebSocket
setupWebSocket(server);

export { app, server };