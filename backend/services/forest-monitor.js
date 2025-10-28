import { getCurrentSensorData } from "../hcs/iot-simulator.js";
import { calculateRegenerationScore } from "../ai/regeneration-score.js";
import { submitMessage } from "../hcs/consensus.js";

// Monitor a forest and submit both IoT data and regeneration scores
export async function monitorForest(forestData, iotTopicId, regenTopicId) {
  try {
    console.log(`\n🌲 Starting forest monitoring for: ${forestData.name}`);

    // Step 1: Get current IoT sensor data
    const iotData = await getCurrentSensorData(
      forestData.id,
      forestData.location,
      iotTopicId
    );
    console.log("✅ IoT data collected and submitted to HCS");

    // Step 2: Calculate regeneration score using Gemini AI + satellite data
    const regenScore = await calculateRegenerationScore(forestData, iotData);
    console.log(`✅ Regeneration score calculated: ${regenScore.score.overall}/100`);

    // Step 3: Submit regeneration score to same HCS topic (tagged as "regeneration")
    await submitMessage(regenTopicId, {
      forestId: forestData.id,
      forestName: forestData.name,
      ...regenScore,
    });
    console.log("✅ Regeneration score submitted to HCS");

    return {
      success: true,
      iotData,
      regenerationScore: regenScore,
    };
  } catch (error) {
    console.error("Error monitoring forest:", error);
    throw error;
  }
}