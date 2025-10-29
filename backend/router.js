import express from 'express';
import multer from 'multer';
import { getCurrentSensorData } from './hcs/iot-simulator.js';
import { calculateRegenerationScore } from './ai/regeneration-score.js';
import { updateForestNFT } from './services/nft-updater.js';
import { mintNFT,grantKyc } from "./mint.js";
import {
  // createTopic,
  submitMessage,
  queryTopic,
  queryTopicWithSequenceNumber,
} from "./hcs/consensus.js";

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ============================================
// IoT & MONITORING ROUTES
// ============================================

router.post('/iot/simulate', async (req, res) => {
  try {
    const { forestId, location, topicId } = req.body;
    const sensorData = await getCurrentSensorData(forestId, location, topicId);
    res.json({ success: true, data: sensorData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/ai/regeneration-score', async (req, res) => {
  try {
    const { forestData, iotData } = req.body;
    const score = await calculateRegenerationScore(forestData, iotData);
    res.json({ success: true, score });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Carbon Chain API is running',
    timestamp: new Date().toISOString()
  });
});

// Mint a new forest NFT
router.post('/nft/mint-forest', async (req, res) => {
  try {
    const { forestData, buyerAccountId } = req.body;
    if (!forestData || !buyerAccountId) {
      return res.status(400).json({ success: false, message: "Missing forestData or buyerAccountId" });
    }
    const result = await mintNFT(forestData, "forest", buyerAccountId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update an existing forest NFT's metadata (IoT, regeneration, etc)
router.post('/nft/update-forest', async (req, res) => {
  try {
    const { tokenId, serialNumber, forestData, topicId } = req.body;
    if (!tokenId || !serialNumber || !forestData) {
      return res.status(400).json({ success: false, message: "Missing tokenId, serialNumber, or forestData" });
    }
    const result = await updateForestNFT(tokenId, serialNumber, forestData, topicId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------- Mint API -----------------
router.post("/mint", async (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type || !data || !data.buyer) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: 'type' and 'data.buyer' are required.",
      });
    }

    console.log(`Received mint request for type: ${type}, buyer: ${data.buyer}`);
    const result = await mintNFT(data, type, data.buyer);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("❌ Minting API Error:", err);
    res
      .status(500)
      .json({ success: false, error: err.message || "Internal server error" });
  }
});

// ----------------- Consensus APIs -----------------

// 1️⃣ Create a new topic
// router.post("/consensus/createTopic", async (req, res) => {
//   try {
//     const topicId = await createTopic();
//     res.status(200).json({ success: true, topicId });
//   } catch (err) {
//     console.error("❌ createTopic Error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// 2️⃣ Submit a message to a topic
router.post("/consensus/submitMessage", async (req, res) => {
  try {
    const { topicId, message } = req.body;
    if (!topicId || !message) {
      return res
        .status(400)
        .json({ success: false, error: "topicId and message are required" });
    }
    await submitMessage(topicId, message);
    res.status(200).json({ success: true, message: "Message submitted" });
  } catch (err) {
    console.error("❌ submitMessage Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3️⃣ Query all messages from a topic
router.get("/consensus/queryTopic/:topicId", async (req, res) => {
  try {
    const { topicId } = req.params;
    if (!topicId) throw new Error("topicId is required");
    const data = await queryTopic(topicId);
    res.status(200).json({ success: true, messages: data });
  } catch (err) {
    console.error("❌ queryTopic Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4️⃣ Query a topic message by sequence number
router.get(
  "/consensus/queryTopic/:topicId/:sequenceNumber",
  async (req, res) => {
    try {
      const { topicId, sequenceNumber } = req.params;
      if (!topicId || !sequenceNumber)
        throw new Error("topicId and sequenceNumber are required");
      const data = await queryTopicWithSequenceNumber(topicId, sequenceNumber);
      res.status(200).json({ success: true, message: data });
    } catch (err) {
      console.error("❌ queryTopicWithSequenceNumber Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

router.post("/grant-kyc", async (req, res) => {
  const { accountId, tokenId } = req.body;
  
  console.log(`Received KYC grant request for token ${tokenId} to account ${accountId}`);

  if (!accountId || !tokenId) {
    console.error("Validation failed: Missing accountId or tokenId.");
    return res.status(400).json({ error: "Both accountId and tokenId are required." });
  }

  try {
    // Call the service function
    const result = await grantKyc(accountId, tokenId);
    
    console.log("✅ KYC Grant successful.", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ KYC Granting API Error:", error.message);
    res.status(500).json({ error: "Failed to grant KYC.", message: error.message });
  }
});

export default router;