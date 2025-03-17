const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json()); // ✅ Ensure JSON parsing

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // ✅ React app connection
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.post("/faq", (req, res) => {
  console.log("Raw request body:", req.body);

  if (!req.body || !req.body.page) {
    return res.status(400).json({ error: "Missing 'page' field in request body" });
  }

  console.log("Navigation request received:", req.body.page);

  // ✅ Send event to React frontend
  io.emit("navigate", req.body.page);

  res.json({ message: "Navigation request received", page: req.body.page });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
