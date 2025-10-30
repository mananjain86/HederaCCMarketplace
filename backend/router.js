import express from 'express';
import multer from 'multer';
import {ethers} from 'ethers';
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
import FOREST_ABI from './abi/ForestTokenMarketplace.json' assert { type: "json" }


const router = express.Router();

const FOREST_ADDRESS = process.env.FOREST_CONTRACT_ADDRESS; 
const RPC_URL = process.env.HEDERA_RPC_URL;

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/forest-data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return res.status(400).json({ success: false, error: "Invalid Forest ID." });
    }

    if (!FOREST_ADDRESS) {
       throw new Error("Forest contract address is not configured on the server.");
    }

    // 1. Connect to the blockchain (read-only)
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, provider);

    // 2. Call the public 'forests' function
    const forest = await contract.forests(id);

    // 3. Check if the forest exists
    if (forest.forestId.toString() === "0") {
      return res.status(404).json({ success: false, error: "Forest not found." });
    }

    // 4. Format the data into clean JSON
    const responseData = {
      success: true,
      forestId: Number(forest.forestId),
      active: forest.active,
      htsTokenId: forest.htsTokenId,
      serial: Number(forest.serial),
      info: {
        location: forest.info.location,
        gpsCoordinates: forest.info.gpsCoordinates,
        areaSize: forest.info.areaSize.toString(),
        ipfsDeedHash: forest.info.ipfsDeedHash,
      },
      totalShares: forest.totalShares.toString(),
      regenerationScore: Number(forest.regenerationScore),
      baselineSequestrationPerYear: forest.baselineSequestrationPerYear.toString(),
      potentialSequestrationPerYear: forest.potentialSequestrationPerYear.toString(),
      accumulatedYield: forest.accumulatedYield.toString(),
      lastUpdated: new Date(Number(forest.lastUpdated) * 1000).toISOString(),
    };

    // 5. Send the JSON response
    res.status(200).json(responseData);

  } catch (error) {
    console.error("Error fetching forest data:", error);
    res.status(500).json({ success: false, error: error.message || "Internal server error." });
  }
});

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

router.post("/tokenize-purchase", async (req, res) => {
  try {
    const { buyerHederaId, amount, ethereumTxHash, buyerEthAddress, projectName } = req.body;

    if (!buyerHederaId || !amount || !ethereumTxHash) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    console.log(`🚀 Starting Hedera tokenization for ETH tx: ${ethereumTxHash}`);

    // Step 1: Create the NFT Metadata and upload to IPFS
    const metadataPayload = {
      id: ethereumTxHash, // Use ETH tx hash as a unique ID
      amount: amount,
      totalPrice: "N/A (Paid on Ethereum)",
      buyer: buyerHederaId,
      name: projectName,
      // Add any other relevant details
    };
    // Note: The 'createNFTMetadata' function in ipfs.js is for NFTs, 
    // but you want to mint a FUNGIBLE token. You'll need to adapt this logic.
    // For now, let's assume you're creating an NFT receipt.
    
    // Step 2: Mint the NFT on Hedera
    // We pass "carbon-credit" as the type to mint.js
    const mintResult = await mintNFT(metadataPayload, "carbon-credit", buyerHederaId);
    if (!mintResult.success) {
      throw new Error("Hedera NFT minting failed.");
    }
    console.log(`✅ Minted NFT ${mintResult.tokenId}-${mintResult.serialNumber}`);

    // Step 3: Submit a record to the Hedera Consensus Service
    const consensusMessage = JSON.stringify({
      type: "carbon_credit_purchase_receipt",
      ethereumTxHash,
      buyerEthAddress,
      buyerHederaId,
      amount,
      nftId: `${mintResult.tokenId}@${mintResult.serialNumber}`,
      timestamp: new Date().toISOString(),
    });

    const HCS_TOPIC_ID = process.env.HCS_TOPIC_ID; // Add your Topic ID to .env
    await submitMessage(HCS_TOPIC_ID, consensusMessage);
    console.log(`✅ Message submitted to HCS Topic ${HCS_TOPIC_ID}`);

    res.status(200).json({ success: true, ...mintResult });

  } catch (err) {
    console.error("❌ Tokenization API Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/tokenize-forest-purchase", async (req, res) => {
  try {
    // UPDATED: Deconstruct the new nested req.body structure
    const { forestData, buyerAccountId } = req.body;

    // First-level validation
    if (!forestData || !buyerAccountId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: forestData or buyerAccountId." 
      });
    }

    // Deconstruct the nested forestData object
    const {
      forestId,
      ethereumTxHash,
      buyerEthAddress,
      location,
      areaSize,
      price,
      ipfsDeedHash,
      sharesBought,
      htsTokenId,
      serial,
      regenerationScore,
      baseline,
      potential
    } = forestData;

    // UPDATED: Validation for the new fields
    if (!buyerAccountId || !ethereumTxHash || !location || !areaSize || !sharesBought) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields inside forestData." 
      });
    }

    console.log(`🚀 Starting Hedera tokenization for ${sharesBought} shares of Forest #${forestId}`);

    // UPDATED: Build a richer metadata payload for the NFT
    const metadataPayload = {
      type: "Forest Share",
      description: `Fractional ownership of ${sharesBought} shares for ${location}.`,
      forestId: forestId,
      location: location,
      areaSize: areaSize,
      sharesBought: sharesBought,
      pricePaid: price,
      buyerAccountId: buyerAccountId,
      buyerEthAddress: buyerEthAddress,
      purchaseTxHash: ethereumTxHash,
      originalNftId: `${htsTokenId}@${serial}`, // Link to the original forest NFT
      regenerationScore: regenerationScore,
      baselineSequestration: baseline,
      potentialSequestration: potential,
      ipfsDeedHash: ipfsDeedHash // Link to the original deed
    };
    
    // UPDATED: Pass the correct buyerAccountId
    const mintResult = await mintNFT(metadataPayload, "forest", buyerAccountId);
    
    if (!mintResult.success) {
      throw new Error(mintResult.error || "Hedera NFT minting failed.");
    }
    
    console.log(`✅ Minted Forest Share NFT ${mintResult.tokenId}-${mintResult.serialNumber}`);
    
    // UPDATED: Consensus message with richer data
    const consensusMessage = JSON.stringify({
      type: "forest_share_purchase_receipt",
      ethereumTxHash,
      buyerEthAddress,
      buyerHederaId: buyerAccountId,
      forestId: forestId,
      location,
      sharesBought,
      pricePaid: price,
      hederaNftId: `${mintResult.tokenId}@${mintResult.serialNumber}`,
      timestamp: new Date().toISOString(),
    });

    const HCS_TOPIC_ID = process.env.HCS_TOPIC_ID;
    await submitMessage(HCS_TOPIC_ID, consensusMessage);
    console.log(`✅ Message submitted to HCS Topic ${HCS_TOPIC_ID}`);

    res.status(200).json({ success: true, ...mintResult });

  } catch (err) {
    console.error("❌ Tokenization API Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;