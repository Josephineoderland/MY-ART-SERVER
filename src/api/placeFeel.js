import express from "express"

const placeFeel = express.Router()

const feelings = [
  "Joy",
  "Calm",
  "Excitement",
  "Adventure",
  "Romance",
  "Mystery",
  "Melancholy",
  "Wonder",
  "Fear",
  "Nostalgia",
  "Euphoria",
  "Delight",
  "Worry",
  "Laughter",
  "Inspiration",
  "Despair",
  "Harmony",
  "Anxiety",
  "Anticipation",
  "Humility",
]

const places = [
  "Beach",
  "Forest",
  "City",
  "Mountain",
  "Desert",
  "Park",
  "Countryside",
  "Sea",
  "River",
  "Ruins",
  "Garden",
  "Cave",
  "Castle",
  "Waterfall",
  "Archipelago",
  "Field",
  "Harbor",
  "Coast",
  "Volcano",
]

placeFeel.get("/feelings", (req, res) => {
  res.json(feelings)
})

placeFeel.get("/places", (req, res) => {
  res.json(places)
})

export default placeFeel
