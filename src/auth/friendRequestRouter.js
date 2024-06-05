import express from "express"
import jwt from "jsonwebtoken"
import FriendshipRequest from "./friendModel.js"
import User from "./userModel.js"
import dotenv from "dotenv"

dotenv.config()

const friendRequestRouter = express.Router()

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

friendRequestRouter.get(
  "/received/:userId",
  authenticateJWT,
  async (req, res) => {
    const { userId } = req.params
    const { id: loggedInUserId } = req.user

    if (userId !== loggedInUserId) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    try {
      const receivedRequests = await FriendshipRequest.find({
        receiverId: userId,
        status: "pending",
      }).populate("senderId", "username")
      res.status(200).json(receivedRequests)
    } catch (error) {
      res.status(500).json({ message: "Server error" })
    }
  }
)

friendRequestRouter.post("/send/:userId", authenticateJWT, async (req, res) => {
  const { userId } = req.params
  const { id: loggedInUserId } = req.user
  console.log(userId)
  console.log(loggedInUserId)

  if (userId === loggedInUserId) {
    return res
      .status(403)
      .json({ message: "Cannot send a friend request to yourself" })
  }

  try {
    const sender = await User.findById(loggedInUserId)
    const receiver = await User.findById(userId)

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" })
    }

    if (
      sender.friends.includes(userId) ||
      receiver.friends.includes(loggedInUserId)
    ) {
      return res.status(400).json({ message: "You are already friends." })
    }

    const existingRequest = await FriendshipRequest.findOne({
      senderId: loggedInUserId,
      receiverId: userId,
    })

    if (existingRequest && existingRequest.status === "pending") {
      return res.status(400).json({ message: "Friend request already sent" })
    }

    if (existingRequest && existingRequest.status === "rejected") {
      existingRequest.status = "pending"
      await existingRequest.save()
      return res.status(201).json({ message: "Friend request sent again" })
    }

    const friendshipRequest = new FriendshipRequest({
      senderId: loggedInUserId,
      receiverId: userId,
    })
    await friendshipRequest.save()
    res.status(201).json({ message: "Friend request sent" })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

friendRequestRouter.get("/sent/:userId", authenticateJWT, async (req, res) => {
  const { userId } = req.params
  const { id: loggedInUserId } = req.user

  if (userId !== loggedInUserId) {
    return res.status(403).json({ message: "Unauthorized" })
  }

  try {
    const sentRequests = await FriendshipRequest.find({
      senderId: userId,
      status: "pending",
    }).populate("receiverId", "username")

    res.status(200).json(sentRequests)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

friendRequestRouter.post("/respond", authenticateJWT, async (req, res) => {
  const { requestId, status } = req.body

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" })
  }

  try {
    const request = await FriendshipRequest.findById(requestId)
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" })
    }
    request.status = status
    await request.save()
    if (status === "accepted") {
      await User.findByIdAndUpdate(request.senderId, {
        $addToSet: { friends: request.receiverId },
      })
      await User.findByIdAndUpdate(request.receiverId, {
        $addToSet: { friends: request.senderId },
      })
    }
    res.status(200).json({ message: `Friend request ${status}` })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

friendRequestRouter.get(
  "/friends/:userId",
  authenticateJWT,
  async (req, res) => {
    const { userId } = req.params

    try {
      const userWithFriends = await User.findById(userId).populate(
        "friends",
        "username"
      )

      if (!userWithFriends) {
        return res.status(404).json({ message: "Användare hittades inte" })
      }

      res.status(200).json(userWithFriends.friends)
    } catch (error) {
      res.status(500).json({ message: "Serverfel" })
    }
  }
)

export default friendRequestRouter
