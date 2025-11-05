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

       if (data.messageType === 'register_user') {
          const userId = data.userId;

          if (!userId) {
            console.warn('⚠️ Missing userId in register_user message');
            return;
          }

          clients.set(userId, ws); // Lưu userId làm key, ws làm value
          console.log(`📲 Registered userId=${userId}`);
          return;
        }

      // 1️⃣ Nếu là message đăng ký userId
        if (data.messageType === 'create_room') {
              //data.users.forEach(u => {
              //clients.set(u.userId, ws); // key = userId, value = socket
              //console.log(`📲 Registered userId=${u.userId} (${u.userFullName})`);
          //});
          //console.log(`📲 Registered client with userId=${data.userId}`);
          //return;
        }

      // 2️⃣ Nếu là message gửi dữ liệu bình thường
      if (data.messageType === 'SEND_MESSAGE') {
        const { userIds, message, messageFromUserId, roomCode } = data;
        console.log(`📩 Message to users [${userIds.join(', ')}]: ${data}`);

        // Gửi cho các client có userId trong danh sách
        clients.forEach((client, uid) => {
            console.log(`check condition uid : ${uid}`);
            if (userIds.includes(uid) && client.readyState === WebSocket.OPEN) {
              const messagePayload = {
              toUserId: uid,
              content: message,
              roomCode:roomCode,
              fromUserId: messageFromUserId,
              timestamp: Date.now(),
            };

            client.send(JSON.stringify(messagePayload));
            console.log(`✅ Sent message to userId=${uid}`);
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


