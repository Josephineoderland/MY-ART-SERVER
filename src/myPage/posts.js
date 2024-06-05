import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import Post from "./Postmodel.js"
import jwt from "jsonwebtoken"
import UserSettings from "./userSettingsModel.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
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

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" })
    }
    req.user = user
    next()
  })
}

router.post(
  "/posts",
  authenticateJWT,
  upload.single("image"),
  async (req, res) => {
    try {
      const { text } = req.body
      const imageUrl = req.file ? "/uploads/" + req.file.filename : null

      const newPost = new Post({
        userId: req.user.id,
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
  }
)

router.get("/posts", authenticateJWT, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id }).sort({
      createdAt: -1,
    })
    res.status(200).json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

router.get("/posts/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const posts = await Post.find({ userId }).sort({ createdAt: -1 })
    res.status(200).json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

router.post("/settings", authenticateJWT, async (req, res) => {
  try {
    const { email, instagram, age, occupation, description } = req.body

    let userSettings = await UserSettings.findOne({ userId: req.user.id })
    if (userSettings) {
      userSettings.email = email
      userSettings.instagram = instagram
      userSettings.age = age
      userSettings.occupation = occupation
      userSettings.description = description
    } else {
      userSettings = new UserSettings({
        userId: req.user.id,
        email,
        instagram,
        age,
        occupation,
        description,
      })
    }

    await userSettings.save()
    res.status(200).json(userSettings)
  } catch (error) {
    console.error("Error updating settings:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

router.get("/settings", authenticateJWT, async (req, res) => {
  try {
    const userSettings = await UserSettings.findOne({ userId: req.user.id })
    res.status(200).json(userSettings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

router.get("/settings/:userId", authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params
    const userSettings = await UserSettings.findOne({ userId })
    res.status(200).json(userSettings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
