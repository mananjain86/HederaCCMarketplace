import express from 'express';
import multer from 'multer';
import {
  uploadImageToIPFS,
  getDataByCid,
  listDataByName,
  createNFTMetadata
} from './ipfs.js';
import { createNFTCollection, mintNFT } from './mint.js';
import { createHCSTopics, submitToHCS, getTopicInfo } from './hcs/hcs-config.js';
import { getCurrentSensorData, startIoTSimulation } from './hcs/iot-simulator.js';
import { calculateRegenerationScore } from './ai/regeneration-score.js';
import { monitorForest } from './services/forest-monitor.js';
import { searchSatelliteImages } from './ai/planet-api.js';
import { 
  getComplianceStatus, 
  canPurchaseForest, 
  canTradeCarbonCredits,
  addKYCRecord,
  updateKYCStatus 
} from './compliance/kyc-system.js';
import { 
  updateForestNFT, 
  batchUpdateForestNFTs,
  scheduleNFTUpdates 
} from './services/nft-updater.js';
import { submitMessage, queryTopic, queryTopicWithSequenceNumber } from './hcs/consensus.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ============================================
// COMPLIANCE ROUTES (ERC-3643)
// ============================================

/**
 * GET /api/compliance/:accountId
 * Get ERC-3643 compliance status for an account
 */
router.get('/compliance/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const status = getComplianceStatus(accountId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/compliance/:accountId/forest-eligibility
 * Check if account can purchase forest areas
 */
router.get('/compliance/:accountId/forest-eligibility', async (req, res) => {
  try {
    const { accountId } = req.params;
    const eligibility = canPurchaseForest(accountId);
    res.json(eligibility);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/compliance/:accountId/trading-eligibility
 * Check if account can trade carbon credits
 */
router.get('/compliance/:accountId/trading-eligibility', async (req, res) => {
  try {
    const { accountId } = req.params;
    const eligibility = canTradeCarbonCredits(accountId);
    res.json(eligibility);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/compliance/kyc
 * Add new KYC record
 * Body: { accountId, role, country, kycStatus, tier }
 */
router.post('/compliance/kyc', async (req, res) => {
  try {
    const { accountId, role, country, kycStatus, tier } = req.body;
    addKYCRecord(accountId, { role, country, kycStatus, tier });
    res.json({ 
      success: true, 
      message: 'KYC record added',
      status: getComplianceStatus(accountId)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/compliance/kyc/:accountId
 * Update KYC status
 * Body: { status: "approved" | "pending" | "rejected" }
 */
router.put('/compliance/kyc/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { status } = req.body;
    const updatedStatus = updateKYCStatus(accountId, status);
    res.json({ success: true, status: updatedStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DYNAMIC NFT UPDATE ROUTES
// ============================================

/**
 * POST /api/nft/update-forest
 * Update a dynamic forest NFT with fresh IoT and regeneration data
 * Body: { tokenId, serialNumber, forestData, topicId }
 */
router.post('/nft/update-forest', async (req, res) => {
  try {
    const { tokenId, serialNumber, forestData, topicId } = req.body;
    
    if (!tokenId || !serialNumber || !forestData || !topicId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const result = await updateForestNFT(tokenId, serialNumber, forestData, topicId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/nft/batch-update-forest
 * Batch update multiple forest NFTs
 * Body: { nfts: [...], topicId }
 */
router.post('/nft/batch-update-forest', async (req, res) => {
  try {
    const { nfts, topicId } = req.body;
    
    if (!Array.isArray(nfts) || !topicId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request format' 
      });
    }

    const results = await batchUpdateForestNFTs(nfts, topicId);
    res.json({ 
      success: true, 
      results,
      updated: results.filter(r => r.success).length,
      total: results.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/nft/schedule-updates
 * Schedule automatic NFT updates
 * Body: { nfts: [...], topicId, intervalHours: 24 }
 */
router.post('/nft/schedule-updates', async (req, res) => {
  try {
    const { nfts, topicId, intervalHours } = req.body;
    const intervalId = scheduleNFTUpdates(nfts, topicId, intervalHours);
    res.json({ 
      success: true, 
      message: `Scheduled updates every ${intervalHours} hours`,
      intervalId: intervalId.toString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// IPFS ROUTES
// ============================================

router.post('/ipfs/upload-image', upload.single('file'), uploadImageToIPFS);
router.get('/ipfs/:cid', getDataByCid);
router.get('/ipfs/search', listDataByName);

router.post('/ipfs/create-metadata', async (req, res) => {
  try {
    const { type, data } = req.body;
    const result = await createNFTMetadata(type, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// NFT ROUTES
// ============================================

router.post('/nft/mint', async (req, res) => {
  try {
    const { type, data, buyerAccountId } = req.body;
    
    if (!buyerAccountId) {
      return res.status(400).json({ 
        success: false, 
        message: 'buyerAccountId is required' 
      });
    }

    // Check compliance before minting
    const compliance = type === 'forest' 
      ? canPurchaseForest(buyerAccountId)
      : canTradeCarbonCredits(buyerAccountId);

    if (!compliance.eligible && type === 'forest' && !compliance.forestEligible) {
      return res.status(403).json({
        success: false,
        message: 'Account not eligible for this purchase',
        compliance
      });
    }

    const result = await mintNFT(data, type, buyerAccountId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// HCS ROUTES
// ============================================

router.post('/hcs/setup', async (req, res) => {
  try {
    const topics = await createHCSTopics();
    res.json({ 
      success: true, 
      topicId: topics.topicId.toString(),
      message: 'HCS topic created for IoT and regeneration data'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/hcs/submit', async (req, res) => {
  try {
    const { topicId, message, messageType } = req.body;
    const receipt = await submitToHCS(topicId, message, messageType);
    res.json({ 
      success: true, 
      status: receipt.status.toString(),
      topicId 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/hcs/topic/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const info = await getTopicInfo(topicId);
    res.json({ 
      success: true, 
      topicId: info.topicId.toString(),
      memo: info.topicMemo,
      sequenceNumber: info.sequenceNumber.toString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Existing consensus routes
router.post('/consensus/submitMessage', async (req, res) => {
  try {
    const { topicId, message } = req.body;
    if (!topicId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'topicId and message are required' 
      });
    }
    await submitMessage(topicId, message);
    res.status(200).json({ success: true, message: 'Message submitted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/consensus/queryTopic/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const data = await queryTopic(topicId);
    res.status(200).json({ success: true, messages: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/consensus/queryTopic/:topicId/:sequenceNumber', async (req, res) => {
  try {
    const { topicId, sequenceNumber } = req.params;
    const data = await queryTopicWithSequenceNumber(topicId, sequenceNumber);
    res.status(200).json({ success: true, message: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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

router.post('/iot/start-monitoring', async (req, res) => {
  try {
    const { forestId, location, topicId, intervalMinutes } = req.body;
    const intervalId = await startIoTSimulation(forestId, location, topicId, intervalMinutes);
    res.json({ 
      success: true, 
      message: `IoT monitoring started for ${forestId}`,
      intervalId: intervalId.toString()
    });
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

router.post('/satellite/search', async (req, res) => {
  try {
    const { coordinates, startDate, endDate } = req.body;
    const images = await searchSatelliteImages(coordinates, startDate, endDate);
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/forest/monitor', async (req, res) => {
  try {
    const { forestData, topicId } = req.body;
    const result = await monitorForest(forestData, topicId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/forest/mint-dynamic-nft', async (req, res) => {
  try {
    const { forestData, buyerAccountId } = req.body;
    
    if (!buyerAccountId) {
      return res.status(400).json({ 
        success: false, 
        message: 'buyerAccountId is required' 
      });
    }

    // Check compliance
    const compliance = canPurchaseForest(buyerAccountId);
    if (!compliance.forestEligible) {
      return res.status(403).json({
        success: false,
        message: 'Account not eligible for forest purchase',
        compliance
      });
    }

    const result = await mintNFT(forestData, 'forest', buyerAccountId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// LEGACY TOKENIZATION ROUTES (from server.js)
// ============================================

router.post('/tokenize-purchase', async (req, res) => {
  try {
    const { buyerHederaId, amount, ethereumTxHash, buyerEthAddress, projectName } = req.body;

    if (!buyerHederaId || !amount || !ethereumTxHash) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    // Check compliance
    const compliance = canTradeCarbonCredits(buyerHederaId);
    if (!compliance.tradingEligible) {
      return res.status(403).json({
        success: false,
        error: 'Account not eligible for carbon credit trading',
        compliance
      });
    }

    const metadataPayload = {
      id: ethereumTxHash,
      amount: amount,
      totalPrice: 'N/A (Paid on Ethereum)',
      buyer: buyerHederaId,
      name: projectName,
    };
    
    const mintResult = await mintNFT(metadataPayload, 'carbon', buyerHederaId);
    if (!mintResult.success) {
      throw new Error('Hedera NFT minting failed.');
    }

    const consensusMessage = JSON.stringify({
      type: 'carbon_credit_purchase_receipt',
      ethereumTxHash,
      buyerEthAddress,
      buyerHederaId,
      amount,
      nftId: `${mintResult.tokenId}@${mintResult.serialNumber}`,
      timestamp: new Date().toISOString(),
    });

    const HCS_TOPIC_ID = process.env.HCS_TOPIC_ID;
    await submitMessage(HCS_TOPIC_ID, consensusMessage);

    res.status(200).json({ success: true, ...mintResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tokenize-forest-purchase', async (req, res) => {
  try {
    const { 
      buyerHederaId, 
      ethereumTxHash, 
      buyerEthAddress, 
      location, 
      areaSize,
      price,
      ipfsDeedHash 
    } = req.body;

    if (!buyerHederaId || !ethereumTxHash || !location || !areaSize) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    // Check compliance
    const compliance = canPurchaseForest(buyerHederaId);
    if (!compliance.forestEligible) {
      return res.status(403).json({
        success: false,
        error: 'Account not eligible for forest purchase',
        compliance
      });
    }

    const metadataPayload = {
      areaId: ethereumTxHash,
      location: location,
      area: areaSize,
      totalPrice: price,
      buyer: buyerHederaId,
      ipfsDeedHash: ipfsDeedHash
    };
    
    const mintResult = await mintNFT(metadataPayload, 'forest', buyerHederaId);
    if (!mintResult.success) {
      throw new Error('Hedera NFT minting failed.');
    }

    const consensusMessage = JSON.stringify({
      type: 'forest_area_purchase_receipt',
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

    res.status(200).json({ success: true, ...mintResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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

export default router;