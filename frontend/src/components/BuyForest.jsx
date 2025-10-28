import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { TreePine, CheckCircle } from "lucide-react";
import axios from "axios";
import ForestABI from "../abi/ForestTokenMarketplace.json";
import CompanyABI from "../abi/HandleCompany.json";
import { useToast } from '../hooks/useToast';

// --- Constants ---
const FOREST_CONTRACT_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "0x9A0b748B6A706eAb1C4Bf8541684C1eE41F0031D";
const COMPANY_ADDRESS =
  import.meta.env.VITE_COMPANY_CONTRACT_ADDRESS ||
  "0x178b7C2cf7361120Ab911844e995dbd0991A3cBf";
const RPC_URL = "https://testnet.hashio.io/api";
const BACKEND_URL = "http://localhost:5000";

// -----------------
export function BuyForest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [forest, setForest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buying, setBuying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [txHash, setTxHash] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [maxShares, setMaxShares] = useState(0);
  const [pricePerShare, setPricePerShare] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { toast } = useToast();

  // Fetch forest details (only when id changes)
  useEffect(() => {
    async function fetchForest() {
      try {
        setLoading(true);
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          FOREST_CONTRACT_ADDRESS,
          ForestABI,
          provider
        );
        // Get forest details
        const forestData = await contract.forests(id);
        // Get remaining shares
        const remaining = await contract.remainingShares(id);
        setMaxShares(Number(remaining));
        // Calculate price per share (same as contract logic)
        let pricePerShareWei = forestData.regenerationScore > 0
          ? (Number(forestData.regenerationScore) * 1e15) / 10
          : 1e15;
        setPricePerShare(pricePerShareWei);

        setForest({
          forestId: Number(forestData.forestId),
          htsTokenId: forestData.htsTokenId,
          serial: Number(forestData.serial),
          location: forestData.info.location,
          gpsCoordinates: forestData.info.gpsCoordinates,
          areaSize: Number(forestData.info.areaSize),
          ipfsDeedHash: forestData.info.ipfsDeedHash,
          totalShares: Number(forestData.totalShares),
          baseline: Number(forestData.baselineSequestrationPerYear),
          potential: Number(forestData.potentialSequestrationPerYear),
          regenerationScore: Number(forestData.regenerationScore),
          lastUpdated: Number(forestData.lastUpdated),
          accumulatedYield: Number(forestData.accumulatedYield),
          active: forestData.active,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load forest details.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchForest();
  }, [id]); // <-- Only depends on id

  // Update total price when sharesToBuy or pricePerShare changes
  useEffect(() => {
    setTotalPrice(pricePerShare * sharesToBuy);
  }, [sharesToBuy, pricePerShare]);

  // Buy forest shares
  const handleBuy = async () => {
    try {
      setBuying(true);
      setStatusMessage("Connecting to wallet...");

      if (!window.ethereum) {
        toast.error("MetaMask not found! Please install MetaMask.");
        return;
      }

      // 1️⃣ Fetch Company Details
      setStatusMessage("Fetching your company details...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const companyContract = new ethers.Contract(COMPANY_ADDRESS, CompanyABI, signer);
      const address = await signer.getAddress();
      const companyDetails = await companyContract.getCompanyDetails(address);

      if (!companyDetails.isRegistered) {
        throw new Error("Your company is not registered. Please register to make a purchase.");
      }

      const buyerHederaId = companyDetails.hederaAccountId;

      // 2️⃣ Confirm MetaMask Transaction
      setStatusMessage("Waiting for MetaMask confirmation...");
      const forestContract = new ethers.Contract(FOREST_CONTRACT_ADDRESS, ForestABI, signer);

      const pricePerShareTinybars = BigInt(pricePerShare); // from contract, tinybars (8 decimals)
      const totalCostTinybars = pricePerShareTinybars * BigInt(sharesToBuy);

      // Convert tinybars to wei (18 decimals) for EVM
      const totalCostWei = totalCostTinybars * 10_000_000_00n; // 10^10

      const tx = await forestContract.buyForestShares(
        forest.forestId,
        sharesToBuy,
        { value: totalCostWei }
      ); 
      setTxHash(tx.hash);
      setStatusMessage("Processing transaction...");
      const receipt = await tx.wait();
      console.log("✅ Hedera transaction successful:", receipt.hash);

      // 4️⃣ Backend NFT Tokenization (mint forest NFT)
      setStatusMessage("Minting your Hedera NFT deed...");
      const payload = {
        forestData: {
          forestId: forest.forestId,
          htsTokenId: forest.htsTokenId,
          serial: forest.serial,
          location: forest.location,
          gpsCoordinates: forest.gpsCoordinates,
          areaSize: forest.areaSize,
          ipfsDeedHash: forest.ipfsDeedHash,
          totalShares: forest.totalShares,
          baseline: forest.baseline,
          potential: forest.potential,
          regenerationScore: forest.regenerationScore,
          lastUpdated: forest.lastUpdated,
          accumulatedYield: forest.accumulatedYield,
          active: forest.active,
          sharesBought: sharesToBuy,
          price: ethers.formatEther(totalPrice.toString()),
          buyerEthAddress: address,
          ethereumTxHash: receipt.hash,
        },
        buyerAccountId: buyerHederaId,
      };

      const response = await axios.post(`${BACKEND_URL}/api/nft/mint-forest`, payload);

      if (!response.data.success) {
        throw new Error(response.data.error || "Backend tokenization failed.");
      }

      setStatusMessage("Purchase complete!");
      setShowModal(true);

      // Auto-close modal → navigate to profile
      setTimeout(() => {
        setShowModal(false);
        navigate("/profile");
      }, 5000);

    } catch (err) {
      console.error("❌ Purchase failed:", err);
      toast.error("❌ Purchase failed: " + err.message);
    } finally {
      setBuying(false);
      setStatusMessage("");
    }
  };

  if (loading)
    return (
      <div className="w-screen h-screen flex items-center justify-center text-emerald-400">
        Loading forest data...
      </div>
    );
  if (error)
    return (
      <div className="w-screen h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  if (!forest) return null;

  return (
    <div className="w-screen h-screen relative flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1500&q=80"
        alt="forest background"
        className="absolute inset-0 w-full h-full object-cover opacity-20 -z-10"
      />

      <div className="max-w-4xl w-full p-6 rounded-2xl bg-slate-800/70 backdrop-blur-md shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <TreePine className="h-12 w-12 text-green-400" />
          <h1 className="text-3xl font-bold">Buy Forest Shares #{forest.forestId}</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-300 text-sm">Location</p>
            <p>{forest.location}</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-300 text-sm">Area Size</p>
            <p>{forest.areaSize} ha</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-300 text-sm">Shares Available</p>
            <p>{maxShares}</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-300 text-sm">Price per Share</p>
            <p className="font-mono text-white">{ethers.formatEther(pricePerShare.toString())} HBAR</p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label htmlFor="shares" className="text-slate-300">Shares to Buy:</label>
          <input
            id="shares"
            type="number"
            min={1}
            max={maxShares}
            value={sharesToBuy}
            onChange={e => setSharesToBuy(Math.max(1, Math.min(maxShares, Number(e.target.value))))}
            className="w-24 px-2 py-1 rounded bg-slate-700 text-white border border-slate-600"
            disabled={buying}
          />
          <span className="text-slate-400">/ {maxShares} shares</span>
        </div>

        <div className="mb-6">
          <p className="text-lg">
            <span className="font-semibold">Total Price:</span>{" "}
            <span className="font-mono text-emerald-400">
              {ethers.formatEther(totalPrice.toString())} HBAR
            </span>
          </p>
        </div>

        {forest.ipfsDeedHash && (
          <div className="mb-6">
            <a
              href={`https://ipfs.io/ipfs/${forest.ipfsDeedHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline"
            >
              View Deed on IPFS
            </a>
          </div>
        )}

        <button
          onClick={handleBuy}
          disabled={!forest.active || buying || maxShares === 0}
          className={`w-full py-3 text-lg font-bold rounded-lg transition-all ${forest.active && maxShares > 0
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              : "bg-gray-600 cursor-not-allowed"
            }`}
        >
          {buying ? statusMessage : forest.active && maxShares > 0 ? "Buy Shares" : "Sold Out"}
        </button>

        {txHash && (
          <p className="mt-4 text-sm text-emerald-300">
            Transaction Hash:{" "}
            <a
              href={`https://hashscan.io/testnet/transaction/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {txHash}
            </a>
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-end justify-center px-4 pb-6 pointer-events-none">
          <div className="max-w-sm w-full bg-emerald-700 text-white rounded-xl shadow-lg p-4 flex items-center space-x-3 pointer-events-auto animate-slide-up">
            <CheckCircle className="h-6 w-6 text-white" />
            <div className="flex flex-col">
              <p className="font-bold">Purchase Successful!</p>
              <p className="text-sm">Your forest shares are now yours.</p>
              <button
                onClick={() => navigate(`/forest/${forest.forestId}`)}
                className="mt-2 py-1 px-3 bg-white text-emerald-700 rounded-lg font-medium text-sm hover:bg-gray-100 transition"
              >
                View Token Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tailwind animation */}
      <style>{`
        @keyframes slide-up {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
