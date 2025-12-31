import express from "express";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import axios from "axios";

dotenv.config();
const app = express();
app.use(express.json());
const server = http.createServer(app);
const port = process.env.PORT || 4000;

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
  },
});

io.on("connection", (socket) => {
  socket.on("identity", async (userId) => {
    await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`, {
      userId,
      socketId: socket.id,
    });
    console.log("userId", userId);
  });
  /*========= delivery boy Location =========== */
  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    await axios.post(
      `${process.env.NEXT_BASE_URL}/api/socket/update-location`,
      { userId, location }
    );
    io.emit("update-deliveryBoy-location", { userId, location });
    console.log("location:", location);
  });

  /*================ message socket =============== */

  socket.on("join-room", async (roomId) => {
    console.log("join-with-roomId:", roomId);
    socket.join(roomId);
  });

  socket.on("send-message", async (message) => {
    await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save`, message);
    io.to(message.roomId).emit("send-message", message);
    console.log(message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// notify
app.post("/notify", (req, res) => {
  const { event, data, socketId } = req.body;
  if (socketId) {
    io.to(socketId).emit(event, data);
  } else {
    io.emit(event, data);
  }

  return res.status(200).json({ success: true });
});

app.get("/", (req, res) => {
  res.send("Socket server is running 🚀");
});

server.listen(port, () => {
  console.log("🚀 Socket server running on port", port);
});
