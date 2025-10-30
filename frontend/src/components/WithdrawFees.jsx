// src/pages/WithdrawFees.jsx

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useToast } from "../hooks/useToast";
import FOREST_ABI from "../abi/ForestTokenMarketplace.json";
import { Wallet, Download } from "lucide-react";

// Make sure to use the same .env variable as your Navbar
const FOREST_ADDRESS =
  import.meta.env.VITE_NEW_FOREST_CONTRACT_ADDRESS ||
  "0xD8a0C3B0CB1FDc61262772eE502a97C74dbA86B9";


export function WithdrawFees() {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);

  // Helper function to get contract (read-only)
  const getReadOnlyContract = () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return null;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, provider);
  };

  // Helper function to get contract (write)
  const getWriteContract = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return null;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Set recipient to signer's address by default if empty
    if (!recipient) {
      setRecipient(await signer.getAddress());
    }

    return new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, signer);
  };

  // Fetch the accumulated fees on load
  const fetchFeeBalance = async () => {
    setIsBalanceLoading(true);
    try {
      const contract = getReadOnlyContract();
      if (!contract) return;

      const feeBalance = await contract.accumulatedPlatformFees();
      setBalance(feeBalance.toString());
    } catch (err) {
      console.error("Failed to fetch fee balance:", err);
      toast.error(err.reason || "Failed to fetch fee balance.");
    }
    setIsBalanceLoading(false);
  };

  useEffect(() => {
    fetchFeeBalance();
  }, []);

  // Function to call withdrawFees(address)
  const handleWithdraw = async () => {
    if (!ethers.isAddress(recipient)) {
      return toast.error("Please enter a valid recipient address.");
    }
    if (balance === "0") {
      return toast.info("There are no fees to withdraw.");
    }

    setIsLoading(true);
    try {
      const contract = await getWriteContract();
      if (!contract) return;

      const tx = await contract.withdrawFees(recipient);
      await tx.wait();

      toast.success("Fees withdrawn successfully!");
      setBalance("0"); // Optimistically set balance to 0
      fetchFeeBalance(); // Re-fetch to confirm
    } catch (err) {
      console.error("Failed to withdraw fees:", err);
      toast.error(err.reason || "Failed to withdraw fees.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b7e4c7]/40 to-[#d8f3dc]/60 text-[#1b4332] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6">
          Withdraw Platform Fees
        </h1>
        <p className="text-[#3a5a40]/70 mb-8">
          Withdraw the accumulated platform fees from the marketplace contract.
          This action can only be performed by the{' '}
          <strong className="text-yellow-600">Platform Admin</strong> account.
        </p>

        {/* Section 1: Current Balance */}
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-[#3a5a40]/20 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#40916c]">
            Available Fees
          </h2>
          {isBalanceLoading ? (
            <div className="h-12 bg-[#b7e4c7]/40 rounded-xl animate-pulse" />
          ) : (
            <div className="text-4xl font-mono text-[#40916c] break-all">
              {ethers.formatEther(balance)}
              <span className="text-2xl text-[#3a5a40]/60 ml-2">ETH</span>
            </div>
          )}
          <p className="text-[#3a5a40]/40 mt-2">
            Raw Balance: {balance} Wei
          </p>
        </div>

        {/* Section 2: Withdraw Action */}
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-[#3a5a40]/20 shadow-2xl">
          <h2 className="text-2xl font-bold mb-4 text-[#40916c]">
            Withdraw Funds
          </h2>
          <div className="flex flex-col space-y-4">
            <label htmlFor="recipient" className="font-bold text-[#3a5a40]">
              Recipient Address
            </label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient address (0x...)"
              className="w-full bg-white/60 border border-[#3a5a40]/20 rounded-xl px-4 py-3 text-[#1b4332] placeholder-[#3a5a40]/40 focus:outline-none focus:ring-2 focus:ring-[#40916c] font-mono shadow-sm"
            />
            <p className="text-sm text-[#3a5a40]/60">
              Fees will be sent to this address. Defaults to your connected
              wallet.
            </p>
            <button
              onClick={handleWithdraw}
              disabled={isLoading || isBalanceLoading || balance === "0"}
              className="w-full bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white px-6 py-3 rounded-full font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg"
            >
              <Download className="h-5 w-5" />
              <span>
                {isLoading ? "Withdrawing..." : "Withdraw All Fees"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}