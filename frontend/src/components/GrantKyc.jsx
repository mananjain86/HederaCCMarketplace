// src/components/KycAdmin.jsx
import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";

// You should get this from your contract or .env file
const CARBON_TOKEN_ID = "0.0.7074735"; 
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://carbonchain-backend.onrender.com";

export default function KycAdmin() {
  const [accountId, setAccountId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGrantKyc = async () => {
    if (!accountId) {
      setMessage("Please enter a Hedera Account ID.");
      return;
    }
    
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/grant-kyc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: accountId,
          tokenId: CARBON_TOKEN_ID, // Specify which token you're granting KYC for
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred.");
      }
      
      setMessage(`Successfully granted KYC to ${accountId}! Tx ID: ${data.transactionId}`);
      setAccountId(""); // Clear input on success

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/70 p-6 rounded-xl border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">
        Admin: Grant Token KYC
      </h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="Enter Hedera Account ID (e.g., 0.0.12345)"
          className="flex-grow bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <button
          onClick={handleGrantKyc}
          disabled={isLoading}
          className="bg-emerald-600 text-white py-2 px-5 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShieldCheck className="h-5 w-5" />
          <span>{isLoading ? "Granting..." : "Grant KYC"}</span>
        </button>
      </div>
      {message && (
        <p className="mt-4 text-sm text-slate-300">{message}</p>
      )}
    </div>
  );
}