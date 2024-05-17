import mongoose from "mongoose"

const chatMessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  image: String,
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
})

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema)

export default ChatMessage
