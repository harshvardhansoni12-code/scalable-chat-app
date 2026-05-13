import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { generateId } from "../utils/helpers.js";

class ChatService {
  constructor() {
    this.users = new Map(); // userId -> User
    this.rooms = new Map(); // roomName -> Set of userIds
    this.messages = new Map(); // roomName -> Array of Messages
    this.messageHistory = 50; // Keep last 50 messages per room
  }

  addUser(socket, username, room = "general") {
    const userId = generateId();
    const user = new User(userId, username, socket, room);

    this.users.set(userId, user);

    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
      this.messages.set(room, []);
    }

    this.rooms.get(room).add(userId);

    return user;
  }

  removeUser(userId) {
    const user = this.users.get(userId);
    if (user) {
      const room = user.room;
      this.users.delete(userId);

      if (this.rooms.has(room)) {
        this.rooms.get(room).delete(userId);

        // Clean up empty rooms
        if (this.rooms.get(room).size === 0) {
          this.rooms.delete(room);
          this.messages.delete(room);
        }
      }
    }
    return user;
  }

  addMessage(userId, content) {
    const user = this.users.get(userId);
    if (!user) return null;

    const messageId = generateId();
    const message = new Message(
      messageId,
      user.username,
      content,
      new Date(),
      user.room,
    );

    const roomMessages = this.messages.get(user.room);
    roomMessages.push(message);

    // Keep only recent messages
    if (roomMessages.length > this.messageHistory) {
      roomMessages.shift();
    }

    return message;
  }

  getRoomUsers(room) {
    const userIds = this.rooms.get(room) || new Set();
    return Array.from(userIds)
      .map((id) => this.users.get(id))
      .filter(Boolean);
  }

  getRoomMessages(room, limit = 20) {
    const messages = this.messages.get(room) || [];
    return messages.slice(-limit);
  }

  getUsersInRoom(room) {
    return this.getRoomUsers(room).map((user) => user.toJSON());
  }

  getAllRooms() {
    return Array.from(this.rooms.keys()).map((room) => ({
      name: room,
      userCount: this.rooms.get(room).size,
    }));
  }

  broadcastToRoom(room, message, excludeUserId = null) {
    const users = this.getRoomUsers(room);
    users.forEach((user) => {
      if (user.id !== excludeUserId && user.socket.readyState === 1) {
        user.socket.send(JSON.stringify(message));
      }
    });
  }

  getUserById(userId) {
    return this.users.get(userId);
  }
}

export const chatService = new ChatService();
