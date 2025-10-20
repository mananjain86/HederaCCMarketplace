console.clear();
import "dotenv/config";
import {
  Hbar,
  Client,
  AccountId,
  PrivateKey,
  TokenType,
  TokenSupplyType,
  TokenCreateTransaction,
  TokenMintTransaction,
  TransferTransaction,
  TokenInfoQuery,
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

// Hedera Client
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(20));

/**
 * STEP 1️⃣ — Create Compliant Token (run ONCE)
 */
export async function createCompliantToken() {
  try {
    console.log("\n🛠️ Creating ERC-3643 style compliant HTS token...");

    const adminKey = operatorKey;
    const kycKey = PrivateKey.generate();
    const freezeKey = PrivateKey.generate();
    const supplyKey = PrivateKey.generate();

    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName("Forest Credit Token")
      .setTokenSymbol("FCT")
      .setTokenType(TokenType.NonFungibleUnique)
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setInitialSupply(0)
      .setAdminKey(adminKey)
      .setKycKey(kycKey)
      .setFreezeKey(freezeKey)
      .setSupplyKey(supplyKey)
      .setMaxTransactionFee(new Hbar(20))
      .execute(client);

    const receipt = await tokenCreateTx.getReceipt(client);
    const tokenId = receipt.tokenId.toString();

    const info = await new TokenInfoQuery().setTokenId(tokenId).execute(client);

    console.log("\n✅ Token created successfully!");
    console.log("Token ID:", tokenId);
    console.log("KYC Key:", kycKey.toString());
    console.log("Supply Key:", supplyKey.toString());
    console.log("Freeze Key:", freezeKey.toString());
    console.log("Token Info:", info);

    return { tokenId, kycKey, freezeKey, supplyKey };
  } catch (err) {
    console.error("❌ Error creating token:", err);
    throw err;
  }
}

/**
 * STEP 2️⃣ — Mint + Transfer NFT (HashPack buyers)
 */
export async function mintNFT(tokenId, supplyKey, type, buyerAccountId) {
  try {
    if (!buyerAccountId) throw new Error("buyerAccountId is required");

    console.log(`\n🌲 Minting NFT for ${type}...`);

    // Compliance check via off-chain API
    console.log("🔍 Checking compliance...");
    const compliance = await fetch(`http://localhost:3000/compliance/${buyerAccountId}`);
    const result = await compliance.json();
    if (result.kycStatus !== "approved") {
      throw new Error("❌ Buyer not KYC verified! Minting aborted.");
    }
    console.log("✅ Compliance check passed!");

    // 1️⃣ Create metadata + upload to IPFS
    console.log("📄 Creating metadata...");
    const metadataResult = await createNFTMetadata(type, { buyer: buyerAccountId });
    if (!metadataResult?.success || !metadataResult.metadataCid) {
      throw new Error("❌ Failed to create metadata or missing CID");
    }

    const metadataBuffer = Buffer.from(`ipfs://${metadataResult.metadataCid}`);

    // 2️⃣ Mint NFT
    console.log("🪙 Minting NFT...");
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadataBuffer])
      .freezeWith(client)
      .sign(supplyKey);

    const mintSubmit = await mintTx.execute(client);
    const mintRx = await mintSubmit.getReceipt(client);
    const serialNumber = mintRx.serials[0].toString();
    console.log(`✅ NFT minted! Serial: ${serialNumber}`);

    // 3️⃣ Transfer NFT to buyer (buyer already associated via HashPack)
    console.log(`📤 Transferring NFT to buyer (${buyerAccountId})...`);
    const transferTx = await new TransferTransaction()
      .addNftTransfer(tokenId, serialNumber, operatorId, buyerAccountId)
      .freezeWith(client)
      .sign(operatorKey);

    const transferSubmit = await transferTx.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);
    console.log("✅ Transfer status:", transferRx.status.toString());

    return {
      success: transferRx.status.toString() === "SUCCESS",
      tokenId,
      serialNumber,
      metadataCid: metadataResult.metadataCid,
      metadataUrl: metadataResult.metadataUrl,
    };
  } catch (error) {
    console.error("❌ Error minting NFT:", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Uncomment this ONCE to create token and log keys
// ---------------------------------------------------------------------------
(async () => {
  const { tokenId, kycKey, freezeKey, supplyKey } = await createCompliantToken();
  console.log("🎉 Save these keys for future use!");
  console.log({ tokenId, kycKey: kycKey.toString(), freezeKey: freezeKey.toString(), supplyKey: supplyKey.toString() });
})();

// ---------------------------------------------------------------------------
// Use this to mint after creation (comment out above after first run)
// ---------------------------------------------------------------------------
// (async () => {
//   const tokenId = "0.0.xxxxxxx"; // replace with created token ID
//   const supplyKey = PrivateKey.fromString("your-supply-key");
//   const buyerAccountId = "0.0.xxxxx"; // HashPack buyer account
//   await mintNFT(tokenId, supplyKey, "forest", buyerAccountId);
// })();
