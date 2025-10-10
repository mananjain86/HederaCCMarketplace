// frontend/src/components/Buy.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import { ArrowLeft, Shield, ShoppingCart } from 'lucide-react';

// --- Load ABIs from local files ---
import MARKETPLACE_ABI from '../abi/CarbonCreditMarketplace.json';
import COMPANY_ABI from '../abi/HandleCompany.json';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

// --- UPDATE THESE WITH YOUR DEPLOYED CONTRACT ADDRESSES ---
const MARKETPLACE_ADDRESS = import.meta.env.VITE_CARBON_CONTRACT_ADDRESS || "0x2b22Ed957d4A0D7cF11Fe049e936a94b2EF05Fb6";
const COMPANY_ADDRESS = import.meta.env.VITE_COMPANY_CONTRACT_ADDRESS || "0x6136a57179ddb0FeF580724263BDc73c96B31863";
// -----------------------------------------------------------

const RPC_URL = "https://testnet.hashio.io/api";
const BACKEND_URL = "http://localhost:5000";

export function Buy() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [amountToBuy, setAmountToBuy] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    // MODIFIED: This now ONLY fetches public listing data and does NOT require a wallet connection.
    const fetchListingDetails = async () => {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
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
      if (typeof window.ethereum === "undefined") throw new Error("MetaMask is not installed.");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // MOVED: Fetch user-specific data (Hedera ID) right when it's needed
      const companyContract = new ethers.Contract(COMPANY_ADDRESS, COMPANY_ABI, provider);
      const companyDetails = await companyContract.getCompanyDetails(signer.address);
      
      if (!companyDetails.isRegistered) {
        throw new Error("Your company is not registered. Please register to make a purchase.");
      }
      const buyerHederaId = companyDetails.hederaAccountId;
      
      // --- PHASE 1: ETHEREUM TRANSACTION ---
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
      // Compute exact tinybars total using on-chain raw value (pricePerCreditRaw is tinybars)
      const qty = BigInt(amountToBuy);
      const pricePerCreditRaw = BigInt(listing.pricePerCreditRaw);
      const totalCostTinybars = pricePerCreditRaw * qty; // bigint
      const tx = await marketplaceContract.buyCarbonCredits(listing.id, amountToBuy, { value: totalCostTinybars });

      setStatusMessage("Processing Ethereum transaction...");
      const receipt = await tx.wait();
      console.log("✅ Ethereum transaction successful:", receipt.hash);
      
      // --- PHASE 2: BACKEND HEDERA WORKFLOW ---
      setStatusMessage("Minting your Hedera NFT receipt...");
      const payload = {
        buyerHederaId: buyerHederaId,
        amount: amountToBuy,
        ethereumTxHash: receipt.hash,
        buyerEthAddress: signer.address,
        projectName: listing.projectName,
      };

      const response = await axios.post(`${BACKEND_URL}/api/tokenize-purchase`, payload);

      if (response.data.success) {
        console.log("✅ Hedera tokenization successful:", response.data);
        alert(`Purchase Complete! Your receipt NFT has been minted on Hedera: Token ID ${response.data.tokenId}`);
        navigate(`/profile`);
      } else {
        throw new Error(response.data.error || "Backend tokenization failed.");
      }

    } catch (err) {
      console.error("Purchase failed:", err);
      alert(`Purchase failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  if (error) return <div className="flex justify-center items-center h-screen"><ErrorMessage message={error} /></div>;
  if (!listing) return null;

  const totalCost = amountToBuy * listing.pricePerCredit;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Marketplace</span>
      </button>

      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl border border-slate-700/50 p-8">
        <h1 className="text-3xl font-bold text-white mb-2">{listing.projectName}</h1>
        <div className="flex items-center space-x-4 mb-6">
          <span className="text-slate-400 text-sm">Listing ID: {listing.id}</span>
          {listing.isVerified && (
            <div className="flex items-center space-x-1 text-emerald-400 text-sm">
              <Shield className="h-4 w-4" />
              <span>Verified</span>
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
            <span className="text-slate-300">Price per Credit</span>
            <span className="font-mono text-white">{listing.pricePerCredit.toFixed(4)} HBAR</span>
          </div>
          <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
            <span className="text-slate-300">Available Credits</span>
            <span className="font-mono text-white">{listing.amount.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">
              Amount to Buy
            </label>
            <input
              type="number"
              id="amount"
              min="1"
              max={listing.amount}
              value={amountToBuy}
              onChange={(e) => setAmountToBuy(Number(e.target.value))}
              className="w-full pl-4 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="border-t border-slate-700 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-300 text-lg">Total Cost</span>
              <span className="text-2xl font-bold text-emerald-400">{totalCost.toFixed(4)} HBAR</span>
            </div>
            <button
              onClick={handlePurchase}
              disabled={isProcessing || amountToBuy > listing.amount}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span>{isProcessing ? 'Processing...' : 'Confirm Purchase'}</span>
            </button>
            {isProcessing && (
              <p className="text-center text-emerald-300 text-sm mt-3 animate-pulse">
                {statusMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}