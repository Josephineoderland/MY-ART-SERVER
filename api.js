import express from "express"
import serverless from "serverless-http"
import drawingDetails from "./drawingDetails.js"
import { activities, characters } from "./data.js"

const api = express()
const router = express.Router()

router.get("/drawing-details", (req, res) => {
  res.json(drawingDetails)
})

router.get("/activities", (req, res) => {
  res.json(activities)
})

router.get("/characters", (req, res) => {
  res.json(characters)
})

router.get("/activities/:id", (req, res) => {
  const id = parseInt(req.params.id)
  const activity = activities.find((activity) => activity.id === id)
  if (!activity) {
    return res.status(404).json({ error: "Activity not found" })
  }
  res.json(activity)
})

router.get("/characters/:id", (req, res) => {
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

router.get("/random-activity", (req, res) => {
  const randomActivity = getRandomItem(activities)
  res.json(randomActivity)
})

router.get("/random-character", (req, res) => {
  const randomCharacter = getRandomItem(characters)
  res.json(randomCharacter)
})

const getRoutes = () => {
  const routes = []
  router.stack.forEach((layer) => {
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

router.get("/", (req, res) => {
  const routes = getRoutes()
  res.json(routes)
})

api.use("/.netlify/functions/api", router)

export const handler = serverless(api)
