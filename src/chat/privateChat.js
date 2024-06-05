import express from "express"
import jwt from "jsonwebtoken"
import PrivateChatMessage from "./PrivateChatMessage.js"
import User from "../auth/userModel.js"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()

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

async function sendMessage(userId, receiverId, message) {
  try {
    const sender = await User.findById(userId)
    if (!sender) {
      throw new Error("User not found")
    }

    const receiver = await User.findById(receiverId)
    if (!receiver) {
      throw new Error("Receiver not found")
    }

    if (!sender.friends.some((friend) => friend.equals(receiver._id))) {
      throw new Error("Cannot send message to non-friend")
    }

    const chatMessage = new PrivateChatMessage({
      sender: userId,
      receiver: receiverId,
      text: message,
    })

    await chatMessage.save()
  } catch (error) {
    console.error(`Error sending message: ${error.message}`)
  }
}

router.post("/sendMessage/:receiverId", authenticateJWT, async (req, res) => {
  const { receiverId } = req.params
  const { text } = req.body

  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const receiver = await User.findById(receiverId)
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" })
    }

    if (!user.friends.includes(receiverId)) {
      return res
        .status(403)
        .json({ message: "Cannot send message to non-friend" })
    }

    const message = new PrivateChatMessage({
      sender: req.user.id,
      receiver: receiverId,
      text,
    })

    await message.save()

    res.status(201).json(message)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/messages/:receiverId", authenticateJWT, async (req, res) => {
  const { receiverId } = req.params

  try {
    const messages = await PrivateChatMessage.find()
      .or([
        {
          sender: req.user.id,
          receiver: receiverId,
        },
        {
          sender: receiverId,
          receiver: req.user.id,
        },
      ])
      .populate({
        path: "sender",
        select: "username",
        transform: (doc) => (doc == null ? null : doc.username),
      })
      .select({
        sender: 1,
        text: 1,
        _id: 0,
        userId: "$sender",
        timestamp: "$createdAt"
      })
      .sort({ createdAt: 1 })
    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/unread-count", authenticateJWT, async (req, res) => {
  try {
    const unreadCount = await PrivateChatMessage.countDocuments({
      receiver: req.user.id,
      isRead: false,
    })

    res.json({ unreadCount })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

router.get("/unread-counts", authenticateJWT, async (req, res) => {
  try {
    const unreadCounts = await PrivateChatMessage.aggregate([
      { $match: { receiver: req.user.id, isRead: false } },
      { $group: { _id: "$sender", count: { $sum: 1 } } },
    ])

    const counts = {}
    unreadCounts.forEach((item) => {
      counts[item._id] = item.count
    })

    res.json({ unreadCounts: counts })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/markAsRead", authenticateJWT, async (req, res) => {
  try {
    await PrivateChatMessage.updateMany(
      { receiver: req.user.id, isRead: false },
      { $set: { isRead: true } }
    )
    res.status(200).json({ message: "Messages marked as read" })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/markAsRead/:senderId", authenticateJWT, async (req, res) => {
  try {
    const { senderId } = req.params
    await PrivateChatMessage.updateMany(
      { receiver: req.user.id, sender: senderId, isRead: false },
      { $set: { isRead: true } }
    )
    res.status(200).json({ message: "Messages marked as read" })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

export { router, sendMessage }
