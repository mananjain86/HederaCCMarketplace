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
  TokenGrantKycTransaction
} from "@hashgraph/sdk";
import { createNFTMetadata } from "./ipfs.js"; // must return { success, metadataCid, metadataUrl }

// Helper: parse key type (ED25519 or ECDSA)
function parsePrivateKey(str) {
  try {
    return PrivateKey.fromStringECDSA(str);
  } catch {
    return PrivateKey.fromStringED25519(str);
  }
}

// Operator (treasury / issuer)
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = parsePrivateKey(process.env.OPERATOR_KEY);
// Initialize Hedera client
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(20));

// Create the NFT collection (Non-Fungible, Finite supply)
export async function createNFTCollection(type, config) {
  // Provide sensible defaults when config not supplied
  if (!config) {
    const defaults =
      type === "forest"
        ? { name: "Forest Area Certificates", symbol: "FAC" }
        : { name: "Carbon Credits", symbol: "CC" };
    config = {
      ...defaults,
      treasuryId: operatorId,
      treasuryKey: operatorKey,
      supplyKey: operatorKey,
      adminKey: operatorKey,
    };
  }

  console.log(`Creating ${config.name} NFT Collection...`);

  // Execute with explicit node list and simple retry loop; set node BEFORE freeze/sign
  const nodeIds = ["0.0.3", "0.0.4", "0.0.5"].map((id) => AccountId.fromString(id));
  let nftCreateSubmit;
  let lastError;
  for (let i = 0; i < nodeIds.length; i++) {
    try {
      const tx = new TokenCreateTransaction()
        .setTokenName(config.name)
        .setTokenSymbol(config.symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(config.treasuryId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1000)
        .setSupplyKey(config.supplyKey)
        .setAdminKey(config.adminKey)
        .setKycKey(operatorKey)
        .setFreezeKey(operatorKey)
        .setMetadataKey(operatorKey)
        .setMaxTransactionFee(new Hbar(20))
        .setTransactionMemo(`Create ${config.symbol} collection`)
        .setNodeAccountIds([nodeIds[i]])
        .freezeWith(client);

      console.log(`nftCreate freeze done on node ${nodeIds[i].toString()}`);
      const signed = await tx.sign(config.treasuryKey);
      console.log("nftCreateTxSign done");
      console.log(`execute attempt ${i + 1} on node ${nodeIds[i].toString()}`);
      nftCreateSubmit = await signed.execute(client);
      console.log("nftCreateSubmit done");
      lastError = undefined;
      break;
    } catch (e) {
      console.error(`execute failed on node ${nodeIds[i].toString()}:`, e?.message || e);
      lastError = e;
    }
  }
  if (!nftCreateSubmit) {
    throw lastError || new Error("TokenCreateTransaction failed on all nodes");
  }
  const nftCreateRx = await nftCreateSubmit.getReceipt(client);
  console.log("nftCreateRx done");

  config.tokenId = nftCreateRx.tokenId;

  console.log(`✅ ${config.name} NFT Collection created with token ID: ${config.tokenId}`);
  return config.tokenId;
}

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
            tokenId: "0.0.7074734",
            adminKey: operatorKey,
          }
        : {
            name: "Carbon Credits",
            symbol: "CC",
            treasuryId: operatorId,
            treasuryKey: operatorKey,
            supplyKey: operatorKey,
            tokenId: "0.0.7074735",
            adminKey: operatorKey,
          };

    if (!buyerAccountId) {
      throw new Error("buyerAccountId is required");
    }

    console.log(`\n🌲 Minting NFT for ${type}...`);

    // NEW: If type is "forest", add IoT and regeneration data
    let dynamicData = { ...data };
    console.log("📄 Creating metadata and uploading to IPFS...");

    // Create metadata with dynamic data
    const metadataResult = await createNFTMetadata(type, dynamicData);
    if (!metadataResult?.success || !metadataResult.metadataCid) {
      throw new Error("❌ Failed to create metadata or missing CID");
    }

    const metadataBuffer = Buffer.from(`ipfs://${metadataResult.metadataCid}`);

    // 2️⃣ Mint NFT
    console.log("🪙 Minting NFT...");
    const mintTx = await new TokenMintTransaction()
      .setTokenId(config.tokenId)
      .setMetadata([metadataBuffer])
      .freezeWith(client)
      .sign(config.supplyKey);

    const mintSubmit = await mintTx.execute(client);
    const mintRx = await mintSubmit.getReceipt(client);
    const serialNumber = mintRx.serials[0].toString();
    console.log(`✅ NFT minted! Serial: ${serialNumber}`);

    await grantKyc(buyerAccountId, config.tokenId);

    // 3️⃣ Transfer NFT to buyer (buyer already associated via HashPack)
    console.log(`📤 Transferring NFT to buyer (${buyerAccountId})...`);
    const transferTx = await new TransferTransaction()
      .addNftTransfer(config.tokenId, serialNumber, operatorId, buyerAccountId)
      .freezeWith(client)
      .sign(operatorKey);

    const transferSubmit = await transferTx.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);
    console.log("✅ Transfer status:", transferRx.status.toString());

    return {
      success: transferRx.status.toString() === "SUCCESS",
      serialNumber,

      metadataCid: metadataResult.metadataCid,
      metadataUrl: metadataResult.metadataUrl,
    };
  } catch (error) {
    console.error("❌ Error minting NFT:", error);
    throw error;
  }
}

export async function grantKyc(accountId, tokenId) {
  try {
    console.log(`Granting KYC for token ${tokenId} to account ${accountId}...`);

    // 1. Create the Grant KYC Transaction
    const transaction = await new TokenGrantKycTransaction()
      .setAccountId(accountId)
      .setTokenId(tokenId)
      .freezeWith(client)
      .sign(operatorKey); // Must be signed by the token's KycKey

    // 2. Execute the transaction
    const txResponse = await transaction.execute(client);
    
    // 3. Get the receipt to confirm success
    const receipt = await txResponse.getReceipt(client);

    console.log(`✅ KYC grant status: ${receipt.status.toString()}`);

    // 4. Return the result
    return {
      status: receipt.status.toString(),
      transactionId: txResponse.transactionId.toString(),
    };
  } catch (error) {
    console.error(`❌ Error granting KYC:`, error);
    throw error; // Re-throw the error to be caught by the server API layer
  }
}