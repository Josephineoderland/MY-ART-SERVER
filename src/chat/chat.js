import express from "express"
import mongoose from "mongoose"
import ChatMessage from "./chatMessageModel.js"
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

router.use(express.json())

router.post("/messages", async (req, res) => {
    const { text, user } = req.body
    try {
        const newMessage = new ChatMessage({ text, user })
        await newMessage.save()
        res.status(201).json(newMessage)
    } catch (error) {
        console.error("Fel vid hantering av meddelandet:", error)
        res.status(500).json({
            error: "Ett fel uppstod vid hantering av meddelandet",
        })
    }
})

router.get("/messages", async (req, res) => {
    try {
        const messages = await ChatMessage.find()
        res.json(messages)
    } catch (error) {
        console.error("Fel vid hämtning av meddelanden:", error)
        res.status(500).json({
            error: "Ett fel uppstod vid hämtning av meddelanden",
        })
    }
})

export default router