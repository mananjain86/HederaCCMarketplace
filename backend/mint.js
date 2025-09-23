console.clear();
import "dotenv/config";

import {
  Hbar,
  Client,
  AccountId,
  PrivateKey,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  TokenCreateTransaction,
} from "@hashgraph/sdk";

import { createNFTMetadata } from "./ipfs.js"; // must return { success, metadataCid, metadataUrl }

// Parse operator credentials (supports ECDSA or ED25519)
function parsePrivateKey(str) {
  try {
    return PrivateKey.fromStringECDSA(str);
  } catch {
    return PrivateKey.fromStringED25519(str);
  }
}

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = parsePrivateKey(process.env.OPERATOR_KEY);

// Initialize Hedera client
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(20));

// Create the NFT collection (Non-Fungible, Finite supply)
// async function createNFTCollection(type, config) {
//   console.log(`Creating ${config.name} NFT Collection...`);

//   const nftCreate = new TokenCreateTransaction()
//     .setTokenName(config.name)
//     .setTokenSymbol(config.symbol)
//     .setTokenType(TokenType.NonFungibleUnique)
//     .setDecimals(0)
//     .setInitialSupply(0)
//     .setTreasuryAccountId(config.treasuryId)
//     .setSupplyType(TokenSupplyType.Finite)
//     .setMaxSupply(1000)
//     .setSupplyKey(config.supplyKey) // supply key required to mint/burn
//     .freezeWith(client);

//   // Sign with the treasury key (here treasuryKey = operatorKey)
//   const nftCreateTxSign = await nftCreate.sign(config.treasuryKey);

//   const nftCreateSubmit = await nftCreateTxSign.execute(client);
//   const nftCreateRx = await nftCreateSubmit.getReceipt(client);

//   config.tokenId = nftCreateRx.tokenId;

//   console.log(`✅ ${config.name} NFT Collection created with token ID: ${config.tokenId}`);
//   return config.tokenId;
// }

// Mint one NFT and transfer it to buyer
// data: arbitrary data passed to createNFTMetadata
// type: "forest" or other
// buyerAccountId: AccountId string like "0.0.x" or AccountId object
export async function mintNFT(data, type, buyerAccountId) {
  try {
    // Configure collection; using operator as both treasury and supply key for simplicity
    const config =
      type == "forest"
        ? {
            name: "Forest Area Certificates",
            symbol: "FAC",
            treasuryId: operatorId,
            treasuryKey: operatorKey,
            supplyKey: operatorKey,
            tokenId: "0.0.6886481",
          }
        : {
            name: "Carbon Credits",
            symbol: "CC",
            treasuryId: operatorId,
            treasuryKey: operatorKey,
            supplyKey: operatorKey,
            tokenId: "0.0.6886497",
          };

    if (!buyerAccountId) {
      throw new Error("buyerAccountId is required");
    }

    console.log(`\n🌲 Minting NFT for ${type}...`);
    console.log("📄 Creating metadata and uploading to IPFS...");

    // Create metadata and upload to IPFS
    const metadataResult = await createNFTMetadata(type, data);
    if (!metadataResult?.success || !metadataResult.metadataCid) {
      throw new Error("Failed to create metadata or missing CID");
    }

    // Prepare metadata buffer (HIP-412-style: ipfs://CID)
    const metadataCID = Buffer.from(`ipfs://${metadataResult.metadataCid}`);

    // Mint NFT (signed by supply key)
    const mintTx = await new TokenMintTransaction()
      .setTokenId(config.tokenId)
      .setMetadata([metadataCID]) // up to 10 entries per tx
      .freezeWith(client)
      .sign(config.supplyKey);

    const mintTxSubmit = await mintTx.execute(client);
    const mintRx = await mintTxSubmit.getReceipt(client);
    const serialNumber = mintRx.serials[0];
    console.log(`✅ NFT minted! Serial number: ${serialNumber}`); // Minting requires supply key. [[Mint NFT](https://docs.hedera.com/hedera/readme/tutorials/token/create-and-transfer-your-first-nft#id-2.-mint-a-new-nft)]

    // Transfer NFT from treasury to buyer (signed by treasury key)
    console.log(`📤 Transferring NFT to buyer...`);
    const transferTx = await new TransferTransaction()
      .addNftTransfer(config.tokenId, serialNumber, config.treasuryId, buyerAccountId)
      .freezeWith(client)
      .sign(config.treasuryKey);

    const transferSubmit = await transferTx.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);
    console.log(`Transfer status: ${transferRx.status}`); // Sender signs transfer. [[Transfer NFT](https://docs.hedera.com/hedera/readme/tutorials/token/create-and-transfer-your-first-nft#id-4.-transfer-the-nft)]

    return {
      success: transferRx.status.toString() === "SUCCESS",
      tokenId: config.tokenId.toString(),
      serialNumber: serialNumber.toString(),
      metadataUrl: metadataResult.metadataUrl,
      metadataCid: metadataResult.metadataCid,
    };
  } catch (error) {
    console.error(`❌ Error minting NFT:`, error);
    throw error;
  }
}