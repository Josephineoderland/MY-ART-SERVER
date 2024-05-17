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
const upload = multer({ dest: process.env.FILE_UPLOAD_DIR })

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

router.use(
  "/uploads",
  express.static(path.join(__dirname, process.env.FILE_UPLOAD_DIR))
)

router.post("/messages", upload.single("image"), async (req, res) => {
  console.log("Request body:", req.body)

  const { text, user } = req.body
  const image = req.file
    ? `${process.env.FILE_UPLOAD_DIR}/${req.file.filename}`
    : null

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Text is required" })
  }

  if (req.file && req.file.buffer) {
    try {
      const fileName = `${process.env.FILE_UPLOAD_DIR}/${req.file.filename}`
      fs.writeFile(fileName, req.file.buffer, (err) => {
        if (err) {
          console.error("Error writing file:", err)
          return res.status(500).json({ error: "Error writing file" })
        }
        console.log("File written successfully.")
      })
    } catch (error) {
      console.error("Error handling file:", error)
      return res.status(500).json({ error: "Error handling file" })
    }
  }

  try {
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

router.post("/messages/:id/like", async (req, res) => {
  const messageId = req.params.id
  try {
    const message = await ChatMessage.findById(messageId)
    if (!message) {
      return res.status(404).json({ error: "Meddelandet hittades inte." })
    }
    message.likes++
    await message.save()
    res.json(message)
  } catch (error) {
    console.error("Fel vid gillande av meddelandet:", error)
    res
      .status(500)
      .json({ error: "Ett fel uppstod vid gillande av meddelandet." })
  }
})

export default router
