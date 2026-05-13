import { server } from './app.js';
import { config } from './config/config.js';

const PORT = config.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});