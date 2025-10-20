import {
  Client,
  TokenUpdateNftsTransaction,
  AccountId,
  PrivateKey,
} from "@hashgraph/sdk";
import { createNFTMetadata } from "../ipfs.js";
import { monitorForest } from "./forest-monitor.js";
import "dotenv/config";

function parsePrivateKey(str) {
  try {
    return PrivateKey.fromStringECDSA(str);
  } catch {
    return PrivateKey.fromStringED25519(str);
  }
}

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = parsePrivateKey(process.env.OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

/**
 * Update Dynamic Forest NFT with new IoT and regeneration data
 * @param {string} tokenId - Token ID (e.g., "0.0.7074734")
 * @param {string} serialNumber - NFT serial number
 * @param {object} forestData - Forest information
 * @param {string} topicId - HCS topic ID
 */
export async function updateForestNFT(tokenId, serialNumber, forestData, topicId) {
  try {
    console.log(`\n🔄 Updating Dynamic Forest NFT ${tokenId}@${serialNumber}...`);

    // Step 1: Get fresh monitoring data
    const monitoringData = await monitorForest(forestData, topicId);
    
    // Step 2: Create updated metadata
    const updatedData = {
      ...forestData,
      iotData: monitoringData.iotData,
      regenerationScore: monitoringData.regenerationScore,
      hcsTopicId: topicId,
      lastUpdated: new Date().toISOString()
    };

    const metadataResult = await createNFTMetadata("forest", updatedData);
    
    // Step 3: Update NFT metadata on-chain
    const newMetadataCID = Buffer.from(`ipfs://${metadataResult.metadataCid}`);
    
    const updateTx = await new TokenUpdateNftsTransaction()
      .setTokenId(tokenId)
      .setSerialNumbers([serialNumber])
      .setMetadata(newMetadataCID)
      .freezeWith(client)
      .sign(operatorKey); // Requires metadata key

    const updateSubmit = await updateTx.execute(client);
    const updateRx = await updateSubmit.getReceipt(client);

    console.log(`✅ NFT metadata updated! Status: ${updateRx.status}`);

    return {
      success: true,
      tokenId,
      serialNumber,
      newMetadataUrl: metadataResult.metadataUrl,
      newMetadataCid: metadataResult.metadataCid,
      regenerationScore: monitoringData.regenerationScore.score.overall,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("❌ Error updating NFT:", error);
    throw error;
  }
}

/**
 * Batch update multiple forest NFTs
 */
export async function batchUpdateForestNFTs(nfts, topicId) {
  const results = [];
  
  for (const nft of nfts) {
    try {
      const result = await updateForestNFT(
        nft.tokenId, 
        nft.serialNumber, 
        nft.forestData, 
        topicId
      );
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        tokenId: nft.tokenId,
        serialNumber: nft.serialNumber,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Schedule automatic NFT updates (e.g., daily)
 */
export function scheduleNFTUpdates(nfts, topicId, intervalHours = 24) {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`⏰ Scheduling NFT updates every ${intervalHours} hours`);
  
  const intervalId = setInterval(async () => {
    console.log("\n🔄 Running scheduled NFT updates...");
    const results = await batchUpdateForestNFTs(nfts, topicId);
    console.log(`✅ Updated ${results.filter(r => r.success).length}/${results.length} NFTs`);
  }, intervalMs);
  
  return intervalId;
}