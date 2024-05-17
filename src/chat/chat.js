import express from "express"
import mongoose from "mongoose"
import multer from "multer"
import { fileURLToPath } from "url"
import path from "path"
import ChatMessage from "./chatMessageModel.js"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const router = express.Router()
const upload = multer({ dest: "uploads/" })
mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}`, {
  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
})
const db = mongoose.connection
db.on("error", console.error.bind(console, "Anslutningsfel:"))
db.once("open", () => {
  console.log("Ansluten till databasen")
})
router.use(express.json())
router.use("/uploads", express.static(path.join(__dirname, "uploads")))

router.post("/messages", upload.single("image"), async (req, res) => {
  const { text, user } = req.body

  const image = req.file
    ? `${process.env.FILE_UPLOAD_DIR}/${req.file.filename}`
    : null
  try {
    if (image) {
      const fileName = `${process.env.FILE_UPLOAD_DIR}/${req.file.filename}`
      fs.writeFile(fileName, req.file.buffer, (a) => {
        console.log(a)
      })
    }
    const newMessage = new ChatMessage({ text, image, user })
    await newMessage.save()
    res.status(201).json(newMessage)
  } catch (error) {
    console.error("Fel vid hantering av meddelandet:", error)
    res.status(500).json({
      error: "Ett fel uppstod vid hantering av meddelandet",
    })
  }
})
router.get("/messages", async (req, res) => {
  try {
    const messages = await ChatMessage.find()
    res.json(messages)
  } catch (error) {
    console.error("Fel vid hämtning av meddelanden:", error)
    res.status(500).json({
      error: "Ett fel uppstod vid hämtning av meddelanden",
    })
  }
})

router.post("/messages/:messagesId/like", async (req, res) => {
  const { messagesId } = req.params

  try {
    const messages = await ChatMessage.findById(messagesId)
    if (!messages) {
      return res.status(404).json({ message: "Thought not found" })
    }
    messages.hearts++
    await messages.save()
    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
