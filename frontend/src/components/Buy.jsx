// frontend/src/components/Buy.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import { ArrowLeft, Shield, ShoppingCart } from "lucide-react";
import { useToast } from '../hooks/useToast';

// --- Load ABIs from local files ---
import MARKETPLACE_ABI from "../abi/CarbonCreditMarketplace.json";
import COMPANY_ABI from "../abi/HandleCompany.json";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";

// --- UPDATE THESE WITH YOUR DEPLOYED CONTRACT ADDRESSES ---
const MARKETPLACE_ADDRESS =
  import.meta.env.VITE_CARBON_CONTRACT_ADDRESS ||
  "0x2b22Ed957d4A0D7cF11Fe049e936a94b2EF05Fb6";
const COMPANY_ADDRESS =
  import.meta.env.VITE_COMPANY_CONTRACT_ADDRESS ||
  "0x6136a57179ddb0FeF580724263BDc73c96B31863";
// -----------------------------------------------------------

const RPC_URL = "https://testnet.hashio.io/api";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://carbonchain-backend.onrender.com";

export function Buy() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [amountToBuy, setAmountToBuy] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // MODIFIED: This now ONLY fetches public listing data and does NOT require a wallet connection.
    const fetchListingDetails = async () => {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          MARKETPLACE_ADDRESS,
          MARKETPLACE_ABI,
          provider
        );
        const details = await contract.getListingDetails(projectId);

        setListing({
          id: projectId,
          projectName: details.projectName,
          amount: Number(details.amount),
          // keep raw on-chain value for exact math; also provide a human-friendly display price
          pricePerCreditRaw: details.pricePerCredit, // bigint (tinybars)
          pricePerCredit: parseFloat(ethers.formatUnits(details.pricePerCredit, 8)),
          isVerified: details.isVerified,
          seller: details.seller,
        });
      } catch (err) {
        console.error("Error fetching listing details:", err);
        setError("Could not find or load the specified project listing.");
      } finally {
        setLoading(false);
      }
    };
    fetchListingDetails();
  }, [projectId]);

  const handlePurchase = async () => {
    if (!listing || amountToBuy <= 0) return alert("Invalid amount.");

    setIsProcessing(true);
    try {
      setStatusMessage("Waiting for MetaMask confirmation...");
      if (typeof window.ethereum === "undefined")
        throw new Error("MetaMask is not installed.");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // --- Verify company registration ---
      const companyContract = new ethers.Contract(
        COMPANY_ADDRESS,
        COMPANY_ABI,
        provider
      );
      const companyDetails = await companyContract.getCompanyDetails(userAddress);

      if (!companyDetails.isRegistered) {
        throw new Error(
          "Your company is not registered. Please register to make a purchase."
        );
      }

      const buyerHederaId = companyDetails.hederaAccountId;

      // --- Phase 1: Hedera (EVM) transaction ---
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      // ⚠️ FIX: Handle Hedera precision (tinybars → HBAR 18-decimals)
      // On-chain price stored as tinybars (1 HBAR = 10^8 tinybars)
      // EVM expects 18-decimals (1 HBAR = 10^18 "wei")
      const qty = BigInt(amountToBuy);
      const pricePerCreditTinybars = BigInt(listing.pricePerCreditRaw);
      const totalCostTinybars = pricePerCreditTinybars * qty;

      // Convert tinybars → EVM-compatible value (multiply by 10^10)
      const totalCostWei = totalCostTinybars * 10_000_000_000n;
      console.log("💰 totalCostWei (to send HBAR):", ethers.formatEther(totalCostWei));
      console.log("💰 totalCostWei (to send):", totalCostWei.toString());

      const tx = await marketplaceContract.buyCarbonCredits(listing.id, amountToBuy, {
        value: totalCostWei,
      });

      setStatusMessage("Processing Hedera transaction...");
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.hash);

      // --- Phase 2: Mint NFT receipt on Hedera ---
      setStatusMessage("Minting your Hedera NFT receipt...");
      const payload = {
        buyerHederaId,
        amount: amountToBuy,
        ethereumTxHash: receipt.hash,
        buyerEthAddress: userAddress,
        projectName: listing.projectName,
      };

      const response = await axios.post(`${BACKEND_URL}/api/tokenize-purchase`, payload);

      if (response.data.success) {
        toast.success(`✅ Purchase complete! NFT receipt minted on Hedera: Token ID ${response.data.tokenId}`);
        navigate(`/`);
      } else {
        throw new Error(response.data.error || "Backend tokenization failed.");
      }
    } catch (err) {
      console.error("❌ Purchase failed:", err);
      toast.error(`Purchase failed: ${err.reason || err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <ErrorMessage message={error} />
      </div>
    );
  if (!listing) return null;

  const totalCost = amountToBuy * listing.pricePerCredit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b7e4c7]/40 to-[#d8f3dc]/60 flex items-center justify-center py-12 text-[#1b4332]">
      <div className="w-full max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-[#40916c] hover:text-[#1b4332] mb-6 font-semibold transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Marketplace</span>
        </button>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-[#3a5a40]/20 p-8 shadow-2xl">
          <h1 className="text-3xl font-extrabold mb-2">
            {listing.projectName}
          </h1>
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-[#3a5a40]/70 text-sm font-mono">
              Listing ID: {listing.id}
            </span>
            {listing.isVerified && (
              <div className="flex items-center space-x-1 bg-[#b7e4c7]/60 px-2 py-0.5 rounded-full text-xs font-bold text-[#1b4332] border border-[#40916c]/30">
                <Shield className="h-4 w-4 text-[#40916c]" />
                <span>Verified</span>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center bg-[#e8f1ea] p-3 rounded-xl border border-[#3a5a40]/10">
              <span className="text-[#3a5a40]/80">Price per Credit</span>
              <span className="font-mono text-[#1b4332]">{listing.pricePerCredit.toFixed(4)} HBAR</span>
            </div>
            <div className="flex justify-between items-center bg-[#e8f1ea] p-3 rounded-xl border border-[#3a5a40]/10">
              <span className="text-[#3a5a40]/80">Available Credits</span>
              <span className="font-mono text-[#1b4332]">
                {listing.amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-[#3a5a40] mb-2"
              >
                Amount to Buy
              </label>
              <input
                type="number"
                id="amount"
                min="1"
                max={listing.amount}
                value={amountToBuy}
                onChange={(e) => setAmountToBuy(Number(e.target.value))}
                className="w-full pl-4 pr-4 py-3 bg-white/60 border border-[#3a5a40]/20 rounded-xl text-[#1b4332] placeholder-[#3a5a40]/40 focus:outline-none focus:ring-2 focus:ring-[#40916c] font-mono shadow-sm"
              />
            </div>

            <div className="border-t border-[#3a5a40]/10 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#3a5a40]/80 text-lg">Total Cost</span>
                <span className="text-2xl font-bold text-[#40916c]">{totalCost.toFixed(4)} HBAR</span>
              </div>
              <button
                onClick={handlePurchase}
                disabled={isProcessing || amountToBuy > listing.amount}
                className="w-full bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white py-3 px-4 rounded-full font-bold flex items-center justify-center space-x-2 transition-all hover:from-[#40916c] hover:to-[#1b4332] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                <span>{isProcessing ? "Processing..." : "Confirm Purchase"}</span>
              </button>
              {isProcessing && (
                <p className="text-center text-[#40916c] text-sm mt-3 animate-pulse">
                  {statusMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
