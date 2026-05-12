import express from "express";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  let count = 0;

  socket.on("message", (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(`messsage:${data}`);
      }
    });
  });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      count++;
      client.send(`Total clients connected: ${count}`);
    }
  });
  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
    socket.send("An error occurred on the server");
  });
  socket.on("close", () => {
    console.log("A client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
