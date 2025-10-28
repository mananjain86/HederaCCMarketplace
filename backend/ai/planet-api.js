import axios from "axios";
import "dotenv/config";
 
const PLANET_API_KEY = process.env.PLANET_API_KEY;
const PLANET_BASE_URL = "https://api.planet.com/data/v1";

// Helper to ensure ISO 8601 date-time format
function toISOStringWithTime(dateStr) {
  // If already has 'T', assume it's fine
  if (dateStr.includes("T")) return dateStr;
  // Otherwise, add midnight time and Z
  return `${dateStr}T00:00:00.000Z`;
}

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
              gte: toISOStringWithTime(startDate),
              lte: toISOStringWithTime(endDate),
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
  }
}