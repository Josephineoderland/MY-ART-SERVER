import { createClient } from "@google/maps"

const googleMapsClient = createClient({
  key: "AIzaSyBjm6qXutJnSumjn5Loz76rU_UHgM52HoA",
})

const searchArtGalleries = async (query) => {
  return new Promise((resolve, reject) => {
    googleMapsClient.places(
      {
        query: query + " art gallery",
        type: "art_gallery",
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
