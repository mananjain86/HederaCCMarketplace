import React, { useState } from "react";
import { Leaf, BarChart3, Building2, Wallet, Sparkles } from "lucide-react";

export function Navbar({ currentView, onViewChange }) {
  const [account, setAccount] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

 const handleMint = async () => {
  setIsMinting(true);
  setMintResult(null);

  try {
    const res = await fetch("http://localhost:5000/api/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { id: 1, amount:10, totalPrice:15, buyer: account },
        type: "carbon",
      }),
    });

    const text = await res.text(); // <-- read raw text
    console.log("Raw response:", text);

    const json = text ? JSON.parse(text) : {}; // <-- parse safely
    console.log("Parsed JSON:", json);

    if (json.success) {
      setMintResult(json);
      alert(`✅ NFT Minted! Token: ${json.tokenId}, Serial: ${json.serialNumber}`);
    } else {
      alert(`❌ Mint failed: ${json.error || "Unknown error"}`);
    }
  } catch (err) {
    console.error("Error calling mint API:", err);
    alert("Minting failed. Check console for details.");
  } finally {
    setIsMinting(false);
  }
};


  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-emerald-400" />
            <span className="text-2xl font-bold text-white">CarbonChain</span>
            <span className="text-sm text-emerald-400 font-medium">Marketplace</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onViewChange("marketplace")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentView === "marketplace"
                  ? "bg-emerald-500 text-white"
                  : "text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Marketplace</span>
            </button>
            <button
              onClick={() => onViewChange("analytics")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentView === "analytics"
                  ? "bg-emerald-500 text-white"
                  : "text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </div>

          {/* Wallet + Mint */}
          <div className="flex items-center space-x-4">
            {account ? (
              <>
                <span className="px-3 py-1 rounded-lg bg-emerald-700 text-white text-sm font-mono">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}

            <button
              onClick={handleMint}
              disabled={isMinting}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isMinting ? "Minting..." : "Mint NFT"}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
