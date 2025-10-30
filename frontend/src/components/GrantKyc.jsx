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
    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-[#3a5a40]/20 shadow-2xl max-w-lg mx-auto text-[#1b4332]">
      <h3 className="text-xl font-extrabold mb-4 flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-[#40916c]" />
        Admin: Grant Token KYC
      </h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="Enter Hedera Account ID (e.g., 0.0.12345)"
          className="flex-grow bg-white/60 border border-[#3a5a40]/20 rounded-xl px-4 py-3 text-[#1b4332] placeholder-[#3a5a40]/40 focus:ring-2 focus:ring-[#40916c] focus:border-[#40916c] font-mono shadow-sm"
        />
        <button
          onClick={handleGrantKyc}
          disabled={isLoading}
          className="bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white py-3 px-6 rounded-full font-bold flex items-center justify-center space-x-2 transition-all hover:from-[#40916c] hover:to-[#1b4332] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <ShieldCheck className="h-5 w-5" />
          <span>{isLoading ? "Granting..." : "Grant KYC"}</span>
        </button>
      </div>
      {message && (
        <p className="mt-4 text-sm font-semibold text-[#40916c]">{message}</p>
      )}
    </div>
  );
}