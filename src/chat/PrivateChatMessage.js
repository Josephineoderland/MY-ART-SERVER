import mongoose from "mongoose"
// @ts-ignore
import User from "../auth/userModel.js"

const privateChatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const PrivateChatMessage = mongoose.model(
  "PrivateChatMessage",
  privateChatMessageSchema
)

export default PrivateChatMessage
