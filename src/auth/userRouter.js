import express from "express"
import User from "./userModel.js"

const userRouter = express.Router()

userRouter.get("/:userId", async (req, res) => {
  const { userId } = req.params
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

export default userRouter