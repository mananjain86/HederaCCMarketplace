// compliance.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Mock KYC Database (replace with MongoDB or Postgres later)
const kycDatabase = {
  "0.0.6918317": { kycStatus: "approved", role: "buyer", country: "IN" },
  "0.0.5678": { kycStatus: "pending", role: "seller", country: "US" },
  "0.0.9999": { kycStatus: "rejected", role: "buyer", country: "FR" },
};

// ERC-3643 style JSON response
app.get("/compliance/:accountId", (req, res) => {
  const accountId = req.params.accountId;
  const record = kycDatabase[accountId];

  if (!record) {
    return res.status(404).json({
      accountId,
      kycStatus: "unknown",
      eligible: false,
      message: "Account not found in KYC database",
    });
  }

  const eligible = record.kycStatus === "approved";
  res.json({
    accountId,
    kycStatus: record.kycStatus,
    role: record.role,
    country: record.country,
    eligible,
    standard: "ERC-3643",
    schemaVersion: "1.0.0",
  });
});

app.listen(3000, () =>
  console.log("✅ Compliance API live at http://localhost:3000")
);
