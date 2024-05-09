import express from "express"
import cors from "cors"
import apiRouter from "./api/api.js"
import chatRouter from "./chat/chat.js"

const app = express()
const port = process.env.SERVER_PORT || 3002

app.use(cors())

app.use("/api", apiRouter)
app.use("/", chatRouter)

app.listen(port, () => {
  console.log(`Chattservern lyssnar på port ${port}`)
})
