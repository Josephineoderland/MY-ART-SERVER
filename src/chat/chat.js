import express from "express"
import mongoose from "mongoose"
import multer from "multer"
import ChatMessage from "./chatMessageModel.js"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()
const upload = multer({ dest: "uploads/" }) // Ange en destination för att spara uppladdade bilder

// Anslut till MongoDB
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

// POST-routen för att skicka meddelanden med bilder
router.post("/messages", upload.single("image"), async (req, res) => {
  const { text, user } = req.body
  const image = req.file ? req.file.path : null // Om en bild är uppladdad, använd sökvägen till den uppladdade filen

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

// GET-routen för att hämta meddelanden
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

export default router
