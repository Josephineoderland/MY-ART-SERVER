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
      if (
        !origin ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("https://art.dev.josephine.nu")
      ) {
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

const router = express.Router()

router.use("/uploads", express.static(path.join(__dirname, "./uploads")))
router.use(
  "/profile-uploads",
  express.static(path.join(__dirname, "./profile-uploads"))
)

router.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json(endpoints)
})

router.use("/api", apiRouter)
router.use("/", chatRouter)
router.use("/maps", mapsRouter)
router.use("/auth", authRouter)
router.use("/search", searchRouter)
router.use("/friends", friendRequestRouter)
router.use("/userId", userRouter)
router.use("/private-chat", privateChatRouter)
router.use("/my-page", postRouter)

app.use("/api", router)

io.on("connection", (socket) => {
  console.log("New client connected")

  socket.on("joinRoom", ({ userId, receiverId }) => {
    console.log(`sendMessage(userId=${userId}, receiverId=${receiverId})`)
    const room = [userId, receiverId].sort().join("-")
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

    io.emit("message", {
      sender: sender.username,
      userId: userId,
      text: message,
    })
    sendMessage(userId, receiverId, message)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected")
  })
})

server.listen(port, () => {
  console.log(`Chattservern lyssnar på port ${port}`)
})
