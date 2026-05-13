import { WebSocketServer } from "ws";
import { chatService } from "../services/ChatService.js";
import { validateMessage } from "../utils/validation.js";
import { config } from "../config/config.js";

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket, request) => {
    console.log("New WebSocket connection");

    let currentUser = null;

    socket.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "join":
            handleJoin(socket, message);
            break;
          case "message":
            handleMessage(socket, message);
            break;
          case "leave":
            handleLeave(socket);
            break;
          default:
            socket.send(
              JSON.stringify({
                type: "error",
                message: "Unknown message type",
              }),
            );
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        socket.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format",
          }),
        );
      }
    });

    socket.on("close", () => {
      if (currentUser) {
        handleDisconnect(currentUser.id);
      }
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    function handleJoin(socket, message) {
      const { username, room = "general" } = message;

      if (!username || username.trim().length === 0) {
        socket.send(
          JSON.stringify({
            type: "error",
            message: "Username is required",
          }),
        );
        return;
      }

      currentUser = chatService.addUser(socket, username.trim(), room);

      // Send welcome message to user
      socket.send(
        JSON.stringify({
          type: "joined",
          user: currentUser.toJSON(),
          room: room,
        }),
      );

      // Send recent messages
      const recentMessages = chatService.getRoomMessages(room);
      socket.send(
        JSON.stringify({
          type: "message_history",
          messages: recentMessages.map((msg) => msg.toJSON()),
        }),
      );

      // Send current users in room
      const roomUsers = chatService.getUsersInRoom(room);
      socket.send(
        JSON.stringify({
          type: "room_users",
          users: roomUsers,
        }),
      );

      // Notify others about new user
      chatService.broadcastToRoom(
        room,
        {
          type: "user_joined",
          user: currentUser.toJSON(),
        },
        currentUser.id,
      );

      console.log(`User ${username} joined room ${room}`);
    }

    function handleMessage(socket, message) {
      if (!currentUser) {
        socket.send(
          JSON.stringify({
            type: "error",
            message: "You must join a room first",
          }),
        );
        return;
      }

      const { content } = message;

      if (!validateMessage(content)) {
        socket.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message content",
          }),
        );
        return;
      }

      const chatMessage = chatService.addMessage(currentUser.id, content);

      if (chatMessage) {
        // Broadcast to all users in the room
        chatService.broadcastToRoom(currentUser.room, {
          type: "new_message",
          message: chatMessage.toJSON(),
        });
      }
    }

    function handleLeave(socket) {
      if (currentUser) {
        handleDisconnect(currentUser.id);
      }
    }

    function handleDisconnect(userId) {
      const user = chatService.removeUser(userId);
      if (user) {
        // Notify others about user leaving
        chatService.broadcastToRoom(user.room, {
          type: "user_left",
          user: user.toJSON(),
        });

        console.log(`User ${user.username} left room ${user.room}`);
      }
      currentUser = null;
    }
  });

  console.log("WebSocket server setup complete");
}
