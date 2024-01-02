const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./actions");
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
require("dotenv").config();
const { executeJs } = require("./executeJs");
const cors = require("cors");
const { executePython } = require("./executePython");
const connectDb = require("./connectDb");
const Job = require("./models/job.model");
const fs = require("fs");
const { addJobQueue } = require("./jobQueue");
const path = require("path");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// app.use(express.static("build"));
// app.use((req, res, next) => {
//   res.sendFile(path.resolve(__dirname, "..", "build", "index.html"));
// });

app.get("/", (req, res) => {
  res.send("server is running");
});

app.get("/status", async (req, res) => {
  const jobId = req.query.id;

  if (jobId === undefined || jobId === null || jobId === "") {
    return res.status(400).json({
      success: false,
      output: "Empty jobId",
    });
  }

  try {
    const job = await Job.findById(jobId);
    if (job === null) {
      return res.status(404).json({
        success: false,
        output: "Job not found",
      });
    }
    return res.status(200).json({
      success: true,
      output: job,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      output: e,
    });
  }
});

app.post("/api/run", async (req, res) => {
  const { language = "js", code } = req.body;
  console.log("language", language);
  if (code === undefined || code === null || code === "") {
    return res.status(400).json({
      success: false,
      output: "Empty code body",
    });
  }
  let job;
  try {
    // need to generate a file with the code
    const filePath = await generateFile(language, code);
    job = await new Job({
      language,
      filePath,
    }).save();

    const jobId = job["_id"];
    await addJobQueue(jobId);

    console.log(jobId);
    res.status(201).json({ success: true, jobId });
  } catch (e) {
    return res.status(500).json({
      success: false,
      output: JSON.stringify(e),
    });
  }
});

const server = http.createServer(app);

const userSocketMap = {};
function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

const io = new Server(server);

// when a connection is established
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId); // join the room

    const clients = getAllConnectedClients(roomId); // get all connected clients in the room
    clients.forEach(({ socketId }) => {
      // send the list of connected clients to all the clients in the room
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // when a client sends a code change
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    // io.to(room) sends the message to all the clients in the room
    // socket.in(room) sends the message to all the clients in the room except the sender
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
      code,
      username: userSocketMap[socket.id],
    });
  });

  socket.on("Typer", ({ roomId, lineNo }) => {
    console.log(userSocketMap);
    io.to(roomId).emit("Typer", {
      username: userSocketMap[socket.id],
      socketId: socket.id,
      lineNo,
    });
  });

  socket.on("UTILS", ({ roomId, language, output, error, mode, loading }) => {
    socket.in(roomId).emit("UTILS", {
      language,
      output,
      error,
      mode,
      loading,
    });
  });

  // when a client disconnects from the server
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

server.listen(PORT, () => {
  connectDb();
  console.log("listening on *:5000");
});
