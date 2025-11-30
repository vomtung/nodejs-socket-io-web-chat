const express = require("express");
const http = require("http");
const WebSocket = require("ws");


const app = require("./src/app"); // import Express app
const server = http.createServer(app); // tạo server HTTP

// WebSocket server dùng chung HTTP server
const wss = new WebSocket.Server({ server });

// Lưu danh sách client cùng với userId
const clients = new Map(); // Map<userId, ws>

wss.on('connection', (ws) => {
  console.log('✅ New client connected');

  ws.on('message', (message) => {
    console.log('✅ server receive message', message.toString());

    try {
      const data = JSON.parse(message.toString());

      if (data.messageType === 'register_user') {
        const userId = data.userId;
        if (!userId) return console.warn('⚠️ Missing userId');
        clients.set(userId, ws);
        console.log(`📲 Registered userId=${userId}`);
        return;
      }

      if (data.messageType === 'TEXT_MESSAGE') {
        const { userIds, message: msgContent, messageFromUserId, roomCode } = data;
        console.log(`📩 Message to users [${userIds.join(', ')}]:`, data);

        for (let [uid, client] of clients.entries()) {
          if (userIds.includes(uid) && client.readyState === WebSocket.OPEN) {
            const payload = {
              toUserId: uid,
              content: msgContent,
              roomCode,
              memberIds: userIds,
              messageType: data.messageType === 'TEXT_MESSAGE' ? 'TEXT_MESSAGE' : undefined,
              fromUserId: messageFromUserId,
              timestamp: Date.now(),
            };
            client.send(JSON.stringify(payload));
            console.log(`✅ Sent message to userId=${uid}`);
          }
        }
      } else if (data.messageType === 'FILE_MESSAGE_IMAGE') {

        const { userIds, message: msgContent, messageFromUserId, roomCode } = data;
        console.log(`📩 Message to users [${userIds.join(', ')}]:`, data);

        for (let [uid, client] of clients.entries()) {
          if (userIds.includes(uid) && client.readyState === WebSocket.OPEN) {
            const payload = {
              toUserId: uid,
              content: msgContent,
              roomCode: roomCode,
              fileIdentifier: data.fileIdentifier,
              fileType: data.fileType,
              memberIds: userIds,
              messageType: data.messageType === 'FILE_MESSAGE_IMAGE' ? 'FILE_MESSAGE_IMAGE' : undefined,
              fromUserId: messageFromUserId,
              timestamp: Date.now(),
            };
            console.log("📩 Sent to user:", payload);
            client.send(JSON.stringify(payload));
            console.log(`✅ Sent message to userId=${uid}`);
          }
        }

      }

    } catch (err) {
      console.error('❌ Invalid message:', err);
    }
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
    // xóa userId tương ứng với ws
    for (let [uid, client] of clients.entries()) {
      if (client === ws) clients.delete(uid);
    }
  });
});

// chạy server HTTP + WS trên cùng port 4000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`📡 HTTP+WebSocket server running on port ${PORT}`);
});
