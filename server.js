const express = require("express");
const http = require("http");

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

// Lưu danh sách client cùng với userId
const clients = new Map(); // Map<ws, userId>

wss.on('connection', (ws) => {
  console.log('✅ New client connected');

  // Khi client gửi userId sau khi connect
  ws.on('message', (message) => {

    console.log('✅ server receive message' + message.toString());

    try {
      const data = JSON.parse(message.toString());

      // 1️⃣ Nếu là message đăng ký userId
          if (data.type === 'create_room') {
              data.users.forEach(u => {
              clients.set(u.userId, ws); // key = userId, value = socket
              console.log(`📲 Registered userId=${u.userId} (${u.userFullName})`);
          });
        console.log(`📲 Registered client with userId=${data.userId}`);
        return;
      }

      // 2️⃣ Nếu là message gửi dữ liệu bình thường
      if (data.type === 'SEND_MESSAGE') {
        const { iuserIds, content } = data;
        console.log(`📩 Message to users [${iuserIds.join(', ')}]: ${content}`);

        // Gửi cho các client có userId trong danh sách
        clients.forEach((uid, client) => {
          if (iuserIds.includes(uid) && client.readyState === WebSocket.OPEN) {
            client.send(`📨 From ${clients.get(ws)}: ${content}`);
          }
        });
      }

    } catch (err) {
      console.error('❌ Invalid message:', err);
    }
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
    clients.delete(ws);
  });
});


