import express from "express"
import cors from "cors"
import apiRouter from "./api/api.js"
import chatRouter from "./chat/chat.js"
import { searchArtGalleries } from "./map/maps.js"

const app = express()
const port = process.env.SERVER_PORT || 3002

app.use(cors())

app.use("/api", apiRouter)
app.use("/", chatRouter)

app.get("/maps/art-galleries", async (req, res) => {
  const { query } = req.query
  try {
    const artGalleries = await searchArtGalleries(query)
    res.json(artGalleries)
  } catch (error) {
    console.error("Error searching for art galleries:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.listen(port, () => {
  console.log(`Chattservern lyssnar på port ${port}`)
})
