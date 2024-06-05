import mongoose from "mongoose"

const userSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  instagram: { type: String, required: true },
  age: { type: Number, required: true },
  occupation: { type: String, required: true },
  description: { type: String, required: true },
  backgroundColor: { type: String, default: "#ffffff" },
})

const UserSettings = mongoose.model("UserSettings", userSettingsSchema)

export default UserSettings
