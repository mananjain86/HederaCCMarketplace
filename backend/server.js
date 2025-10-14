import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { mintNFT } from "./mint.js";

import {
  // createTopic,
  submitMessage,
  queryTopic,
  queryTopicWithSequenceNumber,
} from "./consensus.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: [ "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());
app.use(bodyParser.json());
//API routes


// ----------------- Mint API -----------------
app.post("/api/mint", async (req, res) => {
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
// app.post("/api/consensus/createTopic", async (req, res) => {
//   try {
//     const topicId = await createTopic();
//     res.status(200).json({ success: true, topicId });
//   } catch (err) {
//     console.error("❌ createTopic Error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// 2️⃣ Submit a message to a topic
app.post("/api/consensus/submitMessage", async (req, res) => {
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
app.get("/api/consensus/queryTopic/:topicId", async (req, res) => {
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
app.get(
  "/api/consensus/queryTopic/:topicId/:sequenceNumber",
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
app.post("/api/tokenize-purchase", async (req, res) => {
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

app.post("/api/tokenize-forest-purchase", async (req, res) => {
  try {
    // MODIFIED: Expecting forest-specific data from the frontend
    const { 
      buyerHederaId, 
      ethereumTxHash, 
      buyerEthAddress, 
      location, 
      areaSize,
      price, // Price can be passed for the record
      ipfsDeedHash // IPFS hash of the deed/image
    } = req.body;

    // MODIFIED: Updated validation for new fields
    if (!buyerHederaId || !ethereumTxHash || !location || !areaSize) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    console.log(`🚀 Starting Hedera tokenization for Forest Area at ${location}`);

    // MODIFIED: Building the correct payload for the "forest" type in ipfs.js
    const metadataPayload = {
      areaId: ethereumTxHash, // Use ETH tx hash as a unique ID
      location: location,
      area: areaSize,
      totalPrice: price,
      buyer: buyerHederaId,
      ipfsDeedHash: ipfsDeedHash
    };
    
    // This call is now correct because the payload matches what's needed for "forest"
    const mintResult = await mintNFT(metadataPayload, "forest", buyerHederaId);
    if (!mintResult.success) {
      throw new Error("Hedera NFT minting failed.");
    }
    console.log(`✅ Minted Forest NFT ${mintResult.tokenId}-${mintResult.serialNumber}`);
    // MODIFIED: Updated consensus message structure for forest purchase
    const consensusMessage = JSON.stringify({
      type: "forest_area_purchase_receipt",
      ethereumTxHash,
      buyerEthAddress,
      buyerHederaId,
      location,
      areaSize,
      nftId: `${mintResult.tokenId}@${mintResult.serialNumber}`,
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});