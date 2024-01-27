const express = require("express");         // web app framework
const cors = require("cors");               // sharing resources between domains
const mongoose = require("mongoose");      // database
const userRoutes = require("./routes/userRoutes")
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");

const app = express();      // start an express app
require("dotenv").config();

app.use(cors());
app.use(express.json());    // parse json request

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

const uri = "mongodb+srv://vandoto123:magift123@cluster1.r69jwpt.mongodb.net/chat?retryWrites=true&w=majority"


mongoose.connect(uri)
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });



const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  }
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if(sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", data.msg);
    }
    
  });
});