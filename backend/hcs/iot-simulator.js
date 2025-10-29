import { submitMessage } from "./consensus.js";
import dotenv from 'dotenv';
dotenv.config();

// Simulate realistic IoT sensor data for forest monitoring
export function generateSensorData(forestId, location) {
  const timestamp = new Date().toISOString();
  
  // Realistic ranges for forest environment
  const temperature = (15 + Math.random() * 15).toFixed(2); // 15-30°C
  const humidity = (60 + Math.random() * 30).toFixed(2); // 60-90%
  const soilMoisture = (30 + Math.random() * 40).toFixed(2); // 30-70%
  const airQuality = (50 + Math.random() * 100).toFixed(0); // AQI 50-150
  const lightIntensity = (200 + Math.random() * 800).toFixed(0); // Lux
  const co2Level = (400 + Math.random() * 200).toFixed(0); // ppm

  return {
    forestId,
    location,
    timestamp,
    sensors: {
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      soilMoisture: parseFloat(soilMoisture),
      airQuality: parseInt(airQuality),
      lightIntensity: parseInt(lightIntensity),
      co2Level: parseInt(co2Level),
    },
    deviceId: `IOT-SENSOR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  };
}


// Get current sensor reading (for immediate use)
export async function getCurrentSensorData(forestId, location, topicId = null) {
  const data = generateSensorData(forestId, location);
  
  // Use provided topicId or fall back to env variable
  const topic = topicId || process.env.IOT_TOPIC_ID || process.env.FOREST_TOPIC_ID;
  
  if (!topic) {
    console.error("❌ No HCS topic ID provided");
    throw new Error("HCS topic ID is required");
  }

  try {
    // Convert object to JSON string before submitting to HCS
    const jsonString = JSON.stringify(data);
    await submitMessage(topic, jsonString);
    console.log("✅ IoT data submitted to HCS topic:", topic);
  } catch (error) {
    console.error("❌ Failed to submit IoT data to HCS:", error);
    throw error;
  }
  
  return data;
}