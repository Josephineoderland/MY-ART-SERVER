import mongoose from "mongoose"

const friendshipRequestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
})

friendshipRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true })

const FriendshipRequest = mongoose.model(
  "FriendshipRequest",
  friendshipRequestSchema
)

export default FriendshipRequest
