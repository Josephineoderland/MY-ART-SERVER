import mongoose from "mongoose"

const chatMessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  image: String,
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
})

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema)

export default ChatMessage
