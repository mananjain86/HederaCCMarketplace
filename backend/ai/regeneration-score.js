import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchSatelliteImages } from "./planet-api.js";
import "dotenv/config"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function parseSingleDMS(valueStr, dirStr) {
  if (typeof valueStr !== "string" || typeof dirStr !== "string") return null;
  // Remove degree symbol and parse float
  const value = parseFloat(valueStr.replace(/[^\d.-]/g, ""));
  if (isNaN(value)) return null;
  const dir = dirStr.trim().toUpperCase();
  if (dir === "S" || dir === "W") return -value;
  return value;
}

// Helper: Parse DMS array like [ '3.4653°', 'S', '62.2159°', 'W' ] to {lat, lng}
function parseDMS(str) {
  if (typeof str === "string") {
    // fallback to old logic for string input
    const parts = str.split(/[\s,]+/).filter(Boolean);
    if (parts.length < 2) return null;
    // Try to detect if it's in the new array-like format
    if (parts.length === 4 && ['N','S','E','W'].includes(parts[1].toUpperCase()) && ['N','S','E','W'].includes(parts[3].toUpperCase())) {
      const lat = parseSingleDMS(parts[0], parts[1]);
      const lng = parseSingleDMS(parts[2], parts[3]);
      if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) return null;
      return { lat, lng };
    }
    // fallback: try old DMS logic
    const lat = parseSingleDMS(parts[0], parts[1]);
    const lng = parseSingleDMS(parts[2], parts[3]);
    if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  }
  return null;
}

// Calculate regeneration score using AI analysis
export async function calculateRegenerationScore(forestData, iotData) {
  try {
    console.log("🤖 Calculating regeneration score with AI...");
    // Prepare coordinates - handle different input formats
    let coordinates;
    if (forestData.coordinates) {
      const dmsParsed = parseDMS(forestData.coordinates);
      if (dmsParsed) {
        coordinates = dmsParsed;
      }
    } else {
      console.warn("⚠️  No valid coordinates found, using default location");
      coordinates = { lat: -3.4653, lng: -62.2159 };
    }
    // if (
    //   !coordinates ||
    //   typeof coordinates.lat !== "number" ||
    //   typeof coordinates.lng !== "number" ||
    //   isNaN(coordinates.lat) ||
    //   isNaN(coordinates.lng)
    // ) {
    //   throw new Error("Invalid coordinates for satellite search");
    // }

    console.log(`📍 Using coordinates: ${coordinates.lat}, ${coordinates.lng}`);

    // Fetch satellite data with date range
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    let satelliteData;
    try {
      satelliteData = await searchSatelliteImages(coordinates, startDate, endDate);
    } catch (satErr) {
      console.error("Error searching Planet API:", satErr);
      satelliteData = null;
    }

    // Analyze with Gemini AI (or use fallback scoring)
    const score = await analyzeForestHealth(satelliteData, iotData, forestData);

    return {
      score,
      timestamp: new Date().toISOString(),
      factors: {
        vegetationDensity: score.vegetation,
        soilHealth: score.soil,
        airQuality: score.air,
        waterAvailability: score.water,
        climateConditions: score.climate,
      },
      satelliteImageUrl: satelliteData?._links?.thumbnail || null,
      ndvi: satelliteData?.properties?.ndvi || null,
      coordinates,
    };
  } catch (error) {
    console.error("Error calculating regeneration score:", error);
    // Fallback to rule-based scoring
    return calculateFallbackScore(iotData);
  }
}

// AI-powered analysis using Gemini API
async function analyzeForestHealth(satelliteData, iotData, forestData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `You are a forest ecology expert. Analyze this forest area and provide a regeneration score based on the following data.

Satellite Data:
- NDVI (Normalized Difference Vegetation Index): ${satelliteData?.properties?.ndvi || "N/A"}
- Cloud Cover: ${satelliteData?.properties?.cloud_cover || "N/A"}

IoT Sensor Data:
- Temperature: ${iotData?.sensors?.temperature}°C
- Humidity: ${iotData?.sensors?.humidity}%
- Soil Moisture: ${iotData?.sensors?.soilMoisture}%
- Air Quality Index: ${iotData?.sensors?.airQuality}
- CO2 Level: ${iotData?.sensors?.co2Level} ppm

Forest Information:
- Area: ${forestData.area} hectares
- Type: ${forestData.type || "Mixed"}
- Location: ${forestData.location}

Provide a JSON response with the following structure (scores 0-100):
{
  "overall": <overall regeneration score>,
  "vegetation": <vegetation density score>,
  "soil": <soil health score>,
  "air": <air quality score>,
  "water": <water availability score>,
  "climate": <climate conditions score>,
  "analysis": "<brief explanation of the scores>"
}

Consider:
- Higher NDVI (0.6-0.9) indicates healthy vegetation
- Optimal temperature: 15-25°C
- Optimal humidity: 60-80%
- Optimal soil moisture: 40-60%
- Lower AQI is better (0-50 is good)
- CO2 around 400-450 ppm is optimal`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (Gemini might wrap it in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return analysis;
    }

    throw new Error("Failed to parse Gemini response");
  } catch (error) {
    console.error("AI analysis failed, using fallback:", error.message);
    return calculateFallbackScore(iotData);
  }
}

// Rule-based fallback scoring
function calculateFallbackScore(iotData) {
  const sensors = iotData?.sensors || {};

  // Optimal ranges for forest health
  const tempScore = Math.max(0, 100 - Math.abs((sensors.temperature || 20) - 20) * 3);
  const humidityScore = Math.max(0, 100 - Math.abs((sensors.humidity || 75) - 75) * 2);
  const soilScore = Math.max(0, 100 - Math.abs((sensors.soilMoisture || 50) - 50) * 2);
  const airScore = Math.max(0, 100 - ((sensors.airQuality || 50) - 50) * 0.5);
  const co2Score = Math.max(0, 100 - ((sensors.co2Level || 400) - 400) * 0.2);

  const overall = Math.round((tempScore + humidityScore + soilScore + airScore + co2Score) / 5);

  return {
    overall,
    vegetation: Math.round((humidityScore + soilScore) / 2),
    soil: Math.round(soilScore),
    air: Math.round(airScore),
    water: Math.round(humidityScore),
    climate: Math.round((tempScore + co2Score) / 2),
    analysis: "Fallback scoring used - AI analysis unavailable"
  };
}