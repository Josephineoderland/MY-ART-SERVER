import express from "express"
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import apiRouter from "./api/api.js"
import chatRouter from "./chat/chat.js"
import { mapsRouter } from "./map/maps.js"
import authRouter from "./auth/authRouter.js"
import searchRouter from "./auth/searchRouter.js"
import friendRequestRouter from "./auth/friendRequestRouter.js"
import userRouter from "./auth/userRouter.js"
import privateChatRouter from "./chat/privateChat.js"
import { createServer } from "http"
import { Server } from "socket.io"
import PrivateChatMessage from "./chat/PrivateChatMessage.js"

const app = express()
const port = process.env.SERVER_PORT || 3002

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
})

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("http://localhost")) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json(endpoints)
})

app.use("/api", apiRouter)
app.use("/", chatRouter)
app.use("/maps", mapsRouter)
app.use("/auth", authRouter)
app.use("/search", searchRouter)
app.use("/friends", friendRequestRouter)
app.use("/userId", userRouter)
app.use("/private-chat", privateChatRouter)

io.on("connection", (socket) => {
  console.log("New client connected")

  socket.on("joinRoom", ({ userId, friendId }) => {
    const room = [userId, friendId].sort().join("-")
    socket.join(room)
    console.log(`User ${userId} joined room ${room}`)
  })

  socket.on("sendMessage", async ({ message, userId, friendId }) => {
    const room = [userId, friendId].sort().join("-")
    const newMessage = new PrivateChatMessage({
      sender: userId,
      receiver: friendId,
      text: message,
    })

    await newMessage.save()
    io.to(room).emit("message", { sender: userId, text: message })
    console.log(`Message sent to room ${room}: ${message}`)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected")
  })
})

server.listen(port, () => {
  console.log(`Chattservern lyssnar på port ${port}`)
})
