import express from "express"
import { createClient } from "@google/maps"
import dotenv from "dotenv"

dotenv.config()

const googleMapsClient = createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
})

const getCoordinates = (location) => {
  return new Promise((resolve, reject) => {
    googleMapsClient.geocode({ address: location }, (err, response) => {
      if (err) {
        console.error("Error from Google Maps Geocoding API:", err)
        reject(err)
      } else {
        const results = response.json.results
        if (results.length > 0) {
          const { lat, lng } = results[0].geometry.location
          resolve({ latitude: lat, longitude: lng })
        } else {
          reject(new Error("No results found"))
        }
      }
    })
  })
}

const searchArtGalleries = async (latitude, longitude) => {
  return new Promise((resolve, reject) => {
    googleMapsClient.placesNearby(
      {
        keyword: "art galleries",
        location: [latitude, longitude],
        radius: 5000,
      },
      (err, response) => {
        if (err) {
          console.error("Error from Google Maps Places API:", err)
          reject(err)
        } else {
          resolve(response.json.results)
        }
      }
    )
  })
}

const mapsRouter = express.Router()

mapsRouter.get("/art-galleries", async (req, res) => {
  const { location } = req.query

  if (!location) {
    return res
      .status(400)
      .json({ error: "Location query parameter is required" })
  }

  try {
    const { latitude, longitude } = await getCoordinates(location)
    const artGalleries = await searchArtGalleries(latitude, longitude)
    if (artGalleries.length === 0) {
      return res
        .status(404)
        .json({ error: "No art galleries found in this location" })
    }
    res.json(artGalleries)
  } catch (error) {
    console.error("Error searching for art galleries:", error.message)
    res.status(500).json({ error: "Internal server error: " + error.message })
  }
})

export { searchArtGalleries, mapsRouter }
