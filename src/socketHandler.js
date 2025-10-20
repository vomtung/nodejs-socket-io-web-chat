const socketio = require("socket.io");

function initSocket(server) {
  const io = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("👤 A user connected:", socket.id);

    socket.on("chat message", (msg) => {
      console.log("💬 Message:", msg);
      io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
    });
  });
}

module.exports = { initSocket };
