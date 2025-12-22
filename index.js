import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

// socket server
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL, // react url
    credentials: true,
  },
});
/*==================এখানে মনে রাখো===================*/
// on = receive
// emit = send
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  //   // receive message
  //   socket.on("send-message", (data) => {
  //     console.log("📩 Message:", data);

  //     // send to client
  //     socket.emit("receive-message", "Hello from server 👋");
  //   });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});

server.listen(port, () => {
  console.log("Server running on port :", port);
});
