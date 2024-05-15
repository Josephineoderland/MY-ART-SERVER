import express from "express"
import { createClient } from "@google/maps"

const googleMapsClient = createClient({
  key: "AIzaSyC3bo_j2nNUnH_7w7cDaR2p1WnRvN8-1w4",
})

const searchArtGalleries = async (query) => {
  return new Promise((resolve, reject) => {
    googleMapsClient.places(
      {
        query: "art galleries in ",
      },
      (err, response) => {
        if (err) {
          console.error("Error from Google Maps API:", err)
          reject(err)
        } else {
          console.log("Google Maps API response:", response.json.results)
          resolve(response.json.results)
        }
      }
    )
  })
}

const mapsRouter = express.Router()

mapsRouter.get("/art-galleries", async (req, res) => {
  const { query } = req.query 
  try {
    
    const artGalleries = await searchArtGalleries(query)
    res.json(artGalleries)
  } catch (error) {
    console.error("Error searching for art galleries:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export { searchArtGalleries, mapsRouter }
