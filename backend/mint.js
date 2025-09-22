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
} from "@hashgraph/sdk";

import { createNFTMetadata } from './ipfs.js';

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
  symbol: "FAC",
  treasuryId: operatorId, // Using operator as treasury for simplicity
  supplyKey: operatorKey,
  tokenId: null  
};

const CARBON_NFT_CONFIG = {
  name: "Carbon Credits",
  symbol: "CC",
  treasuryId: operatorId, // Using operator as treasury for simplicity
  supplyKey: operatorKey,
  tokenId: null  
}

// Create the Forest NFT Collection (call once)
async function createtNFTCollection(type) {
  if (type == "forest") {
    config = FOREST_NFT_CONFIG;
  } else {
    config = CARBON_NFT_CONFIG;
  }
  try {
    console.log("Creating Forest NFT Collection...");
    
    const nftCreate = new TokenCreateTransaction()
      .setTokenName(config.name)
      .setTokenSymbol(config.symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(config.treasuryId)
      .setSupplyType(TokenSupplyType.Finite)
      .setSupplyKey(config.supplyKey)
      .freezeWith(client);

    // Submit the transaction
    const nftCreateTxSign = await nftCreate.sign(config.supplyKey);
    const nftCreateSubmit = await nftCreateTxSign.execute(client);
    const nftCreateRx = await nftCreateSubmit.getReceipt(client);
    config.tokenId = nftCreateRx.tokenId;
    
    console.log(`✅ ${config.name} NFT Collection created with token ID: ${tokenId}`);
    return tokenId;
  } catch (error) {
    throw new Error(`Failed to create ${config.name} NFT collection: ${error.message}`);
  }
}

// Mint Forest Area NFT for a specific buyer
async function mintNFT(data, type) {
  if (type == "forest") {
    config = FOREST_NFT_CONFIG;
  } else {
    config = CARBON_NFT_CONFIG;
  }
  try {
    console.log(`\n🌲 Minting NFT for ${type}...`);
    
    // Ensure we have a forest NFT collection
    if (config.tokenId == null) {
      forestTokenId = await createtNFTCollection(type);
    }
    
    // Generate metadata and upload to IPFS
    console.log("📄 Creating metadata and uploading to IPFS...");
    const metadataResult = await createNFTMetadata(type, data);
    
    if (!metadataResult.success) {
      throw new Error("Failed to create metadata");
    }
    
    // Create metadata CID buffer
    const metadataCID = Buffer.from(`ipfs://${metadataResult.metadataCid}`);
    
    // Mint the NFT
    console.log("🔨 Minting NFT on Hedera...");
    const mintTx = await new TokenMintTransaction()
      .setTokenId(config.tokenId)
      .setMetadata([metadataCID])
      .freezeWith(client);

    const mintTxSign = await mintTx.sign(operatorKey);
    const mintTxSubmit = await mintTxSign.execute(client);
    const mintRx = await mintTxSubmit.getReceipt(client);
    const serialNumber = mintRx.serials[0];
    
    console.log(`✅ NFT minted! Serial number: ${serialNumber}`);
    
    // Transfer NFT from treasury to buyer
    console.log(`📤 Transferring NFT to buyer...`);
    const transferTx = await new TransferTransaction()
      .addNftTransfer(config.tokenId, serialNumber, config.treasuryId, buyerAccountId)
      .freezeWith(client);
``    .sign(operatorKey);

    const transferSubmit = await transferTx.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);
    
    if (transferRx.status.toString() === "SUCCESS") {
      console.log(`✅ NFT successfully transferred to buyer!`);
    }
    
    return {
      success: true,
      tokenId: config.tokenId.toString(),
      serialNumber: serialNumber.toString(),
      metadataUrl: metadataResult.metadataUrl,
      metadataCid: metadataResult.metadataCid
    };
    
  } catch (error) {
    console.error(`❌ Error minting Forest Area NFT:`, error);
    throw error;
  }
}

export { mintNFT };