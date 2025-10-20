import { AccountId } from "@hashgraph/sdk";

// In-memory KYC database (replace with real database in production)
const kycDatabase = new Map();

// Initialize with some test data
kycDatabase.set("0.0.6918", { 
  kycStatus: "approved", 
  role: "buyer", 
  country: "IN",
  verificationDate: new Date().toISOString(),
  tier: "gold"
});
kycDatabase.set("0.0.5678", { 
  kycStatus: "pending", 
  role: "seller", 
  country: "US",
  verificationDate: null,
  tier: "silver"
});
kycDatabase.set("0.0.9999", { 
  kycStatus: "rejected", 
  role: "buyer", 
  country: "FR",
  verificationDate: null,
  tier: null
});

// ERC-3643 Compliance Standard
export function getComplianceStatus(accountId) {
  const record = kycDatabase.get(accountId);

  if (!record) {
    return {
      accountId,
      kycStatus: "unknown",
      eligible: false,
      message: "Account not found in KYC database",
      standard: "ERC-3643",
      schemaVersion: "1.0.0",
    };
  }

  const eligible = record.kycStatus === "approved";
  return {
    accountId,
    kycStatus: record.kycStatus,
    role: record.role,
    country: record.country,
    tier: record.tier,
    eligible,
    verificationDate: record.verificationDate,
    standard: "ERC-3643",
    schemaVersion: "1.0.0",
  };
}

// Check if account can purchase forest areas
export function canPurchaseForest(accountId) {
  const compliance = getComplianceStatus(accountId);
  
  // Additional forest-specific checks
  const forestEligible = 
    compliance.eligible && 
    compliance.role === "buyer" &&
    ["US", "IN", "CA", "EU"].includes(compliance.country); // Allowed countries

  return {
    ...compliance,
    forestEligible,
    restrictions: forestEligible ? [] : ["Geographic restrictions apply"]
  };
}

// Check if account can trade carbon credits
export function canTradeCarbonCredits(accountId) {
  const compliance = getComplianceStatus(accountId);
  
  return {
    ...compliance,
    tradingEligible: compliance.eligible && compliance.tier === "gold"
  };
}

// Add new KYC record
export function addKYCRecord(accountId, data) {
  kycDatabase.set(accountId, {
    kycStatus: data.kycStatus || "pending",
    role: data.role,
    country: data.country,
    tier: data.tier || "silver",
    verificationDate: data.kycStatus === "approved" ? new Date().toISOString() : null
  });
}

// Update KYC status
export function updateKYCStatus(accountId, status) {
  const record = kycDatabase.get(accountId);
  if (!record) {
    throw new Error("Account not found");
  }
  
  record.kycStatus = status;
  record.verificationDate = status === "approved" ? new Date().toISOString() : null;
  kycDatabase.set(accountId, record);
  
  return getComplianceStatus(accountId);
}