import "dotenv/config";
import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
} from "@hashgraph/sdk";

// ---------------------------
// 1️⃣ Parse operator key correctly
// ---------------------------
function parseOperatorKey(key) {
  // Remove 0x prefix if present
  if (key.startsWith("0x")) {
    key = key.slice(2);
  }
  return PrivateKey.fromStringECDSA(key);
}

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = parseOperatorKey(process.env.OPERATOR_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(20));

// ---------------------------
// 2️⃣ Generate token keys
// ---------------------------
function generateKeys() {
  return {
    adminKey: PrivateKey.generate(),
    supplyKey: PrivateKey.generate(),
    kycKey: PrivateKey.generate(),
    freezeKey: PrivateKey.generate(),
  };
}

// ---------------------------
// 3️⃣ Create NFT token function
// ---------------------------
async function createToken(name, symbol, maxSupply = 10000) {
  const { adminKey, supplyKey, kycKey, freezeKey } = generateKeys();

  const tx = await new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setTreasuryAccountId(operatorId)
    .setAdminKey(adminKey)
    .setSupplyKey(supplyKey)
    .setKycKey(kycKey)
    .setFreezeKey(freezeKey)
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(maxSupply)
    .freezeWith(client);

  // Sign only with operator (treasury)
  const signTx = await tx.sign(operatorKey);
  const submitTx = await signTx.execute(client);
  const receipt = await submitTx.getReceipt(client);

  const tokenId = receipt.tokenId.toString();

  console.log(`\n🎉 Token created: ${name} (${symbol})`);
  console.log("Token ID:", tokenId);
  console.log("Admin Key:", adminKey.toString());
  console.log("Supply Key:", supplyKey.toString());
  console.log("KYC Key:", kycKey.toString());
  console.log("Freeze Key:", freezeKey.toString());
  console.log("Max Supply:", maxSupply);

  return {
    tokenId,
    adminKey: adminKey.toString(),
    supplyKey: supplyKey.toString(),
    kycKey: kycKey.toString(),
    freezeKey: freezeKey.toString(),
  };
}

// ---------------------------
// 4️⃣ Run one-time creation
// ---------------------------
(async () => {
  try {
    const forestToken = await createToken("Forest Area Certificates", "FCT");
    const carbonToken = await createToken("Carbon Credit Token", "CCT");

    console.log("\n✅ All tokens created successfully!");
    console.log("Forest Token:", forestToken);
    console.log("Carbon Token:", carbonToken);
    console.log(
      "\n💡 Save these keys safely! Add them to your .env for minting."
    );
  } catch (err) {
    console.error("❌ Error creating tokens:", err);
  }
})();
