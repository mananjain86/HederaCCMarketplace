import axios from "axios";
import "dotenv/config";

const PLANET_API_KEY = process.env.PLANET_API_KEY;
const PLANET_BASE_URL = "https://api.planet.com/data/v1";

// Search for satellite images for a given location
export async function searchSatelliteImages(coordinates, startDate, endDate) {
  try {
    const { lat, lng } = coordinates;
    
    const searchRequest = {
      item_types: ["PSScene"],
      filter: {
        type: "AndFilter",
        config: [
          {
            type: "GeometryFilter",
            field_name: "geometry",
            config: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
          {
            type: "DateRangeFilter",
            field_name: "acquired",
            config: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            type: "RangeFilter",
            field_name: "cloud_cover",
            config: {
              lte: 0.2, // Less than 20% cloud cover
            },
          },
        ],
      },
    };

    const response = await axios.post(
      `${PLANET_BASE_URL}/quick-search`,
      searchRequest,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(PLANET_API_KEY + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.features[0]; // Return most recent image
  } catch (error) {
    console.error("Error searching Planet API:", error.response?.data || error.message);
    // Return mock data if API fails
    return getMockSatelliteData(coordinates);
  }
}

// Download satellite image (simplified - would need asset activation in production)
export async function downloadSatelliteImage(imageId) {
  try {
    // In production, you'd activate the asset and download
    // For now, return mock image URL
    return `https://mock-satellite-images.com/${imageId}.png`;
  } catch (error) {
    console.error("Error downloading image:", error);
    return null;
  }
}

// Mock satellite data for testing without API key
function getMockSatelliteData(coordinates) {
  return {
    id: `mock-${Date.now()}`,
    properties: {
      acquired: new Date().toISOString(),
      cloud_cover: Math.random() * 0.2,
      ndvi: 0.6 + Math.random() * 0.3, // Normalized Difference Vegetation Index
      item_type: "PSScene",
    },
    geometry: {
      coordinates: [[coordinates.lng, coordinates.lat]],
    },
    _links: {
      thumbnail: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800",
    },
  };
}