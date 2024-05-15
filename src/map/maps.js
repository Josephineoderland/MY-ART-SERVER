import { createClient } from "@google/maps"

const googleMapsClient = createClient({
  key: "AIzaSyC3bo_j2nNUnH_7w7cDaR2p1WnRvN8-1w4",
})

const searchArtGalleries = async (query) => {
  return new Promise((resolve, reject) => {
    googleMapsClient.places(
      {
        query: query + " art",
      },
      (err, response) => {
        if (err) {
          reject(err)
        } else {
          resolve(response.json.results)
        }
      }
    )
  })
}

export { searchArtGalleries }
