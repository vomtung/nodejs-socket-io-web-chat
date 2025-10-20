const { Server } = require("socket.io");

function initSocket(server) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("👤 A user connected:", socket.id);

    socket.on("chat message", (msg) => {
      io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
}

module.exports = { initSocket };
