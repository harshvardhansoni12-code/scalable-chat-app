import express from 'express';
import { chatService } from '../services/ChatService.js';

const router = express.Router();

// Get all rooms
router.get('/rooms', (req, res) => {
  try {
    const rooms = chatService.getAllRooms();
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get messages for a specific room
router.get('/rooms/:roomName/messages', (req, res) => {
  try {
    const { roomName } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const messages = chatService.getRoomMessages(roomName, limit);
    res.json({ messages: messages.map(msg => msg.toJSON()) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get users in a specific room
router.get('/rooms/:roomName/users', (req, res) => {
  try {
    const { roomName } = req.params;
    const users = chatService.getUsersInRoom(roomName);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;