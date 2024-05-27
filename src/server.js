import express from "express"
import cors from "cors"
import initializeSocket from "./chat/socketHandler.js"
import http from "http"
import listEndpoints from "express-list-endpoints"
import apiRouter from "./api/api.js"
import chatRouter from "./chat/chat.js"
import { mapsRouter } from "./map/maps.js"
import authRouter from "./auth/authRouter.js"
import searchRouter from "./auth/searchRouter.js"
import friendRequestRouter from "./auth/friendRequestRouter.js"
import userRouter from "./auth/userRouter.js"
const app = express()
const port = process.env.SERVER_PORT || 3002

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

app.listen(port, () => {
  console.log(`Chattservern lyssnar på port ${port}`)
})
