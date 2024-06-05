import express from "express"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import User from "./userModel.js"
import dotenv from "dotenv"
import { fileURLToPath } from "url"
import multer from "multer"
import path from "path"
import fs from "fs"

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

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
}

const profileUploadsDir = path.join(__dirname, "../profile-uploads")
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir)
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

router.post("/register", upload.single("profileImage"), async (req, res) => {
  const { username, password } = req.body

  try {
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" })
    }

    const profileImageUrl = req.file ? `/profile-uploads/${req.file.filename}` : null
    const user = new User({ username, password, profileImageUrl })
    await user.save()
    const token = generateToken(user)

    res.status(201).json({ token })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/login", async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = generateToken(user)
    res.status(200).json({ token })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
})



export default router
