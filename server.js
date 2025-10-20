const http = require("http");
const app = require("./src/app");
const { initSocket } = require("./src/socketHandler");

const server = http.createServer(app);

// Khởi tạo Socket.IO
initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
