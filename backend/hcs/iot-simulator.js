import { submitMessage } from "./consensus.js";

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

// Submit IoT data to HCS at regular intervals
export async function startIoTSimulation(forestId, location, topicId, intervalMinutes = 15) {
  console.log(`🌲 Starting IoT simulation for forest ${forestId}`);
  console.log(`📡 Submitting data every ${intervalMinutes} minutes to topic ${topicId}`);

  // Submit initial data
  const initialData = generateSensorData(forestId, location);
  await submitMessage(topicId, initialData);
  console.log("✅ Initial sensor data submitted");

  // Set up interval for continuous monitoring
  const intervalMs = intervalMinutes * 60 * 1000;
  const intervalId = setInterval(async () => {
    try {
      const sensorData = generateSensorData(forestId, location);
      await submitMessage(topicId, sensorData);
      console.log(`📊 Sensor data submitted at ${sensorData.timestamp}`);
    } catch (error) {
      console.error("Error submitting sensor data:", error);
    }
  }, intervalMs);

  return intervalId;
}

// Get current sensor reading (for immediate use)
export async function getCurrentSensorData(forestId, location, topicId) {
  const data = generateSensorData(forestId, location);
  await submitMessage(topicId, data);
  return data;
}