const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const allowedOrigins = ["https://amubhya.test", 'http://amubhya.test', "https://katakreasi.com", "http://127.0.0.1:8000"]; // Ganti dengan alamat domain yang diizinkan
const io = socketio(server, {
  transports: ["websocket", "polling"], // Aktifkan WebSocket
  cors: {
    origin: allowedOrigins, // Change this to the specific origin you want to allow
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigins);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
const { ExpressPeerServer } = require("peer");
const options = { // Perbaiki nama variabel ke "options"
  debug: true,
}
app.use("/peerjs", ExpressPeerServer(server, options));
app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(() => {
      io.to(roomId).emit("user-connected", userId);
    }, 1000);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName); // Menggunakan userName dalam emit pesan
    });

    socket.on("disconnect", () => {
      console.log('DC', userId);
      io.to(roomId).emit("user-disconnected", userId); // Kirim pesan ketika pengguna keluar
    });
  });
});
server.listen(process.env.PORT || 3030);