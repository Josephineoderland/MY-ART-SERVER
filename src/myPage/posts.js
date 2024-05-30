import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import Post from "./Postmodel.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url) // Hämta nuvarande filnamn
const __dirname = path.dirname(__filename)

const router = express.Router()

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

const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

router.post("/posts", upload.single("image"), async (req, res) => {
  try {
    const { userId, text } = req.body
    const imageUrl = req.file ? "/uploads/" + req.file.filename : null

    const newPost = new Post({
      userId,
      text,
      imageUrl,
      createdAt: new Date(),
    })

    await newPost.save()

    res.status(201).json(newPost)
  } catch (error) {
    console.error("Error creating post:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
