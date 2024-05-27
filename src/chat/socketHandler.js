import { Server } from "socket.io";
import ChatMessage from "./chatMessageModel.js";

function initializeSocket(server) {
  const io = new Server(server);

  io.of("/chat").on("connection", (socket) => {
    console.log("A user connected to chat");
    
    socket.on("chatMessage", async (data) => {
      console.log("Received chat message:", data);
      try {
        const newMessage = new ChatMessage({ text: data.text, user: data.user });
        await newMessage.save();
        io.of("/chat").emit("chatMessage", newMessage);
      } catch (error) {
        console.error("Error saving chat message:", error);
      }
    });
  });
}

export default initializeSocket;