import express from "express"
import FriendshipRequest from "./friendModel.js"
import User from "./userModel.js"

const friendRequestRouter = express.Router()

friendRequestRouter.get("/received/:userId", async (req, res) => {
  const { userId } = req.params

  try {
    const receivedRequests = await FriendshipRequest.find({
      receiverId: userId,
      status: "pending",
    }).populate("senderId", "username")
    res.status(200).json(receivedRequests)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

friendRequestRouter.post("/send/:userId", async (req, res) => {
  const { userId } = req.params
  const { senderId } = req.body

  try {
    const sender = await User.findById(senderId)
    const receiver = await User.findById(userId)

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" })
    }

    const existingRequest = await FriendshipRequest.findOne({
      senderId,
      userId,
    })

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" })
    }

    const friendshipRequest = new FriendshipRequest({ senderId, receiverId: userId })
    await friendshipRequest.save()
    res.status(201).json({ message: "Friend request sent" })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

friendRequestRouter.post("/respond", async (req, res) => {
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
    res.status(200).json({ message: `Friend request ${status}` })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

export default friendRequestRouter
