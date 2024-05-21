import express from "express"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import User from "./userModel.js"
import dotenv from "dotenv"

dotenv.config()

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

router.post("/register", async (req, res) => {
  const { username, password } = req.body

  try {
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" })
    }

    const user = new User({ username, password })
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
