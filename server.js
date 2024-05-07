import express from "express"
import drawingDetails from "./drawingDetails.js"
import { activities, characters } from "./data.js"

const app = express()
const PORT = process.env.PORT || 3001

app.get("/drawing-details", (req, res) => {
  res.json(drawingDetails)
})

app.get("/activities", (req, res) => {
  res.json(activities)
})

app.get("/characters", (req, res) => {
  res.json(characters)
})

app.get("/activities/:id", (req, res) => {
  const id = parseInt(req.params.id)
  const activity = activities.find((activity) => activity.id === id)
  if (!activity) {
    return res.status(404).json({ error: "Activity not found" })
  }
  res.json(activity)
})

app.get("/characters/:id", (req, res) => {
  const id = parseInt(req.params.id)
  const character = characters.find((character) => character.id === id)
  if (!character) {
    return res.status(404).json({ error: "Character not found" })
  }
  res.json(character)
})

const getRandomItem = (items) => {
  const randomIndex = Math.floor(Math.random() * items.length)
  return items[randomIndex]
}

app.get("/random-activity", (req, res) => {
  const randomActivity = getRandomItem(activities)
  res.json(randomActivity)
})

app.get("/random-character", (req, res) => {
  const randomCharacter = getRandomItem(characters)
  res.json(randomCharacter)
})

const getRoutes = () => {
  const routes = []
  app._router.stack.forEach((layer) => {
    if (layer.route) {
      const route = {
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }
      routes.push(route)
    }
  })
  return routes
}

app.get("/", (req, res) => {
  const routes = getRoutes()
  res.json(routes)
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})