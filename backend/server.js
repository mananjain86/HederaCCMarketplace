import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { mintNFT } from "./mint.js";
import {
  createTopic,
  submitMessage,
  queryTopic,
  queryTopicWithSequenceNumber,
} from "./consensus.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});