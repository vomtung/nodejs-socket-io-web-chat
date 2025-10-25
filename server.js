const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Khi có client kết nối
wss.on("connection", (ws, req) => {
  console.log("✅ Client connected:", req.socket.remoteAddress);

  // Gửi chào mừng
  ws.send("👋 Welcome to WebSocket server!");

  // Nhận message từ client
  ws.on("message", (message) => {
    console.log("📩 Received:", message.toString());

    // Phản hồi lại client
    ws.send(`Server received: ${message}`);
  });

  // Khi client ngắt kết nối
  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 WebSocket server running at ws://localhost:${PORT}`);
});
