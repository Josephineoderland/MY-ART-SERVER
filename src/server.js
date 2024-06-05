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
import { router as privateChatRouter, sendMessage } from "./chat/privateChat.js"
import { createServer } from "http"
import { Server } from "socket.io"
import User from "./auth/userModel.js"
import postRouter from "./myPage/posts.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.SERVER_PORT || 3005

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
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

app.use("/uploads", express.static(path.join(__dirname, "./uploads")))
app.use("/profile-uploads", express.static(path.join(__dirname, "./profile-uploads")))

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
app.use("/my-page", postRouter)

io.on("connection", (socket) => {
  // console.log(socket)
  console.log("New client connected")

  socket.on("joinRoom", ({ userId, receiverId }) => {
    console.log(`sendMessage(userId=${userId}, receiverId=${receiverId})`)
    const room = [userId, receiverId].sort().join("-") // Skapa ett unikt rum baserat på användar-IDs
    socket.join(room)
  })

  socket.on("sendMessage", async ({ message, userId, receiverId }) => {
    console.log(
      `sendMessage(message=${message}, userId=${userId}, receiverId=${receiverId})`
    )
    const sender = await User.findById(userId)
    if (!sender) {
      console.log("Sender not found: " + userId)
      return
    }
    // await User.findById(userId)
    io.emit("message", { sender: sender.username, text: message })
    sendMessage(userId, receiverId, message)
    // io.to(room).emit("message", { sender: "Server", text: message })
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected")
  })
})

server.listen(port, () => {
  console.log(`Chattservern lyssnar på port ${port}`)
})
