# Chat App

A real-time chat application built with Node.js, Express, and WebSockets.

## Features

- Real-time messaging with WebSocket connections
- Multiple chat rooms support
- User presence indicators
- Message history
- Clean, responsive UI
- Input validation and sanitization
- Error handling and reconnection

## Project Structure

```
chat-app/
├── src/
│   ├── controllers/         # HTTP route handlers
│   │   └── chatController.js
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── models/             # Data models
│   │   ├── Message.js
│   │   └── User.js
│   ├── services/           # Business logic
│   │   └── ChatService.js
│   ├── utils/              # Helper functions
│   │   ├── helpers.js
│   │   └── validation.js
│   ├── websocket/          # WebSocket handlers
│   │   └── websocketHandler.js
│   ├── config/             # Configuration
│   │   └── config.js
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── public/                 # Static frontend files
│   ├── index.html
│   ├── styles.css
│   └── chat.js
├── .env                    # Environment variables
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   PORT=3000
   NODE_ENV=development
   MAX_MESSAGE_LENGTH=1000
   MAX_ROOM_SIZE=50
   ```

### Running the Application

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a username (2-20 characters, alphanumeric, underscore, hyphen only)
3. Optionally specify a room name (defaults to "general")
4. Click "Join Chat" to enter the chat room
5. Start messaging!

## API Endpoints

### REST API

- `GET /api/chat/rooms` - Get all available rooms
- `GET /api/chat/rooms/:roomName/messages` - Get messages for a specific room
- `GET /api/chat/rooms/:roomName/users` - Get users in a specific room

### WebSocket Events

#### Client to Server

- `join` - Join a chat room
  ```json
  {
    "type": "join",
    "username": "string",
    "room": "string"
  }
  ```

- `message` - Send a message
  ```json
  {
    "type": "message",
    "content": "string"
  }
  ```

- `leave` - Leave the current room
  ```json
  {
    "type": "leave"
  }
  ```

#### Server to Client

- `joined` - Confirmation of joining a room
- `message_history` - Recent messages in the room
- `room_users` - List of users in the room
- `new_message` - New message received
- `user_joined` - User joined the room
- `user_left` - User left the room
- `error` - Error message

## Architecture Highlights

### Separation of Concerns
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data management
- **Models**: Define data structures
- **Middleware**: Handle cross-cutting concerns (logging, errors)
- **Utils**: Reusable helper functions

### WebSocket Management
- Connection handling with proper cleanup
- Room-based message broadcasting
- User presence tracking
- Message validation and sanitization

### Frontend Architecture
- Class-based JavaScript for better organization
- Event-driven UI updates
- Responsive design with CSS Grid/Flexbox
- Error handling and user feedback

## Security Features

- Input validation and sanitization
- XSS protection
- Message length limits
- Username format validation
- Error handling without exposing internals

## Customization

### Adding New Features

1. **New message types**: Extend the WebSocket handler in `src/websocket/websocketHandler.js`
2. **Database integration**: Add database models and update the ChatService
3. **Authentication**: Add middleware for user authentication
4. **File uploads**: Extend the message model and add upload handling

### Configuration

Modify `src/config/config.js` to add new configuration options.

## Development Tips

- Use `npm run dev` for development with auto-restart
- Check the browser console for WebSocket connection status
- Monitor server logs for debugging
- Use the REST API endpoints to inspect room state

## Troubleshooting

### Common Issues

1. **Connection refused**: Make sure the server is running on the correct port
2. **WebSocket connection failed**: Check if your firewall is blocking the connection
3. **Messages not appearing**: Check browser console for JavaScript errors
4. **Username rejected**: Ensure username meets validation requirements (2-20 chars, alphanumeric + underscore/hyphen)

### Debugging

- Enable detailed logging by setting `NODE_ENV=development`
- Check browser developer tools for WebSocket messages
- Monitor server console for connection events and errors