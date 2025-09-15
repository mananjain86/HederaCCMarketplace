console.clear();
import "dotenv/config";

import {
  Client,
  AccountId,
  PrivateKey,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  TokenCreateTransaction,
  TokenAssociateTransaction,
} from "@hashgraph/sdk";

import { createForestAreaNFTMetadata } from './ipfs.js';

// Operator credentials
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);

// Flexible private key parser
function parsePrivateKey(str) {
  try {
    return PrivateKey.fromStringECDSA(str);
  } catch {
    return PrivateKey.fromStringED25519(str);
  }
}
const operatorKey = parsePrivateKey(process.env.OPERATOR_KEY);

// Initialize Hedera client
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Forest NFT Collection Configuration
const FOREST_NFT_CONFIG = {
  name: "Forest Area Certificates",
  symbol: "FOREST",
  maxSupply: 10000,
  treasuryId: operatorId, // Using operator as treasury for simplicity
  supplyKey: operatorKey  // Using operator key as supply key
};

let forestTokenId = null;

// Create the Forest NFT Collection (call once)
async function createForestNFTCollection() {
  try {
    console.log("Creating Forest NFT Collection...");
    
    const nftCreate = new TokenCreateTransaction()
      .setTokenName(FOREST_NFT_CONFIG.name)
      .setTokenSymbol(FOREST_NFT_CONFIG.symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(FOREST_NFT_CONFIG.treasuryId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(FOREST_NFT_CONFIG.maxSupply)
      .setSupplyKey(FOREST_NFT_CONFIG.supplyKey)
      .freezeWith(client);

    // Submit the transaction
    const nftCreateTxSign = await nftCreate.sign(treasuryKey);
    const nftCreateSubmit = await nftCreateTxSign.execute(client);
    const nftCreateRx = await nftCreateSubmit.getReceipt(client);
    forestTokenId = nftCreateRx.tokenId;
    
    console.log(`✅ Forest NFT Collection created with token ID: ${forestTokenId}`);
    return forestTokenId;
  } catch (error) {
    throw new Error(`Failed to create Forest NFT collection: ${error.message}`);
  }
}

// Mint Forest Area NFT for a specific buyer
async function mintForestAreaNFT(buyerAccountId, areaId, location, area, totalPrice) {
  try {
    console.log(`\n🌲 Minting Forest Area NFT for area ${areaId}...`);
    
    // Ensure we have a forest NFT collection
    if (!forestTokenId) {
      forestTokenId = await createForestNFTCollection();
    }
    
    // Generate metadata and upload to IPFS
    console.log("📄 Creating metadata and uploading to IPFS...");
    const metadataResult = await createForestAreaNFTMetadata(areaId, location, area, buyerAccountId, totalPrice);
    
    if (!metadataResult.success) {
      throw new Error("Failed to create metadata");
    }
    
    // Create metadata CID buffer
    const metadataCID = Buffer.from(`ipfs://${metadataResult.metadataCid}`);
    
    // Mint the NFT
    console.log("🔨 Minting NFT on Hedera...");
    const mintTx = await new TokenMintTransaction()
      .setTokenId(forestTokenId)
      .setMetadata([metadataCID])
      .freezeWith(client);

    const mintTxSign = await mintTx.sign(operatorKey);
    const mintTxSubmit = await mintTxSign.execute(client);
    const mintRx = await mintTxSubmit.getReceipt(client);
    const serialNumber = mintRx.serials[0];
    
    console.log(`✅ NFT minted! Serial number: ${serialNumber}`);
    
    // Associate token with buyer's account
    console.log(`🔗 Associating NFT with buyer's account...`);
    // Note: In a real implementation, you would need the buyer's private key to sign this
    // For now, we'll assume the association is handled separately or the buyer has pre-associated
    
    // Transfer NFT from treasury to buyer
    console.log(`📤 Transferring NFT to buyer...`);
    const transferTx = await new TransferTransaction()
      .addNftTransfer(forestTokenId, serialNumber, FOREST_NFT_CONFIG.treasuryId, buyerAccountId)
      .freezeWith(client);
``    .sign(treasuryKey);

    const transferSubmit = await transferTx.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);
    
    if (transferRx.status.toString() === "SUCCESS") {
      console.log(`✅ NFT successfully transferred to buyer!`);
    }
    
    return {
      success: true,
      tokenId: forestTokenId.toString(),
      serialNumber: serialNumber.toString(),
      metadataUrl: metadataResult.metadataUrl,
      metadataCid: metadataResult.metadataCid
    };
    
  } catch (error) {
    console.error(`❌ Error minting Forest Area NFT:`, error);
    throw error;
  }
}

export {
  createForestNFTCollection,
  mintForestAreaNFT
};