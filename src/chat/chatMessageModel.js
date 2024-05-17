import mongoose from "mongoose"

const chatMessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  image: String,
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
})

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema)

export default ChatMessage
