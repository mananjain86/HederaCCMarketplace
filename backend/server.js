// backend/server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { mintNFT } from "./mint.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mint API
app.post("/api/mint", async (req, res) => {
  try {
    const { type, data } = req.body;
    // Validate required fields
    if (!type || !data || !data.buyer) {
      return res.status(400).json({ success: false, error: "Missing required fields: 'type' and 'data.buyer' are required." });
    }

    console.log(`Received mint request for type: ${type}, buyer: ${data.buyer}`);
    const result = await mintNFT(data, type);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    // Log the full error on the server for debugging
    console.error("❌ Minting API Error:", err);
    // Send a generic, user-friendly error message to the client
    res.status(500).json({ success: false, error: err.message || "An internal server error occurred during the minting process." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
