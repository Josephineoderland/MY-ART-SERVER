import express from "express"
import User from "./userModel.js"

const searchRouter = express.Router()

searchRouter.get("/", async (req, res) => {
  const { searchTerm } = req.query
  try {
    const users = await User.find({
      username: { $regex: searchTerm, $options: "i" },
    })
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

export default searchRouter
