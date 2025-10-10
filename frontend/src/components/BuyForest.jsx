import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { TreePine, CheckCircle } from "lucide-react";
import axios from "axios";
import ForestABI from "../abi/ForestTokenMarketplace.json";
import CompanyABI from "../abi/HandleCompany.json";

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

  // Fetch forest listing details
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
        const listing = await contract.getListingDetails(id);
        const parsed = {
          listingId: Number(listing.listingId),
          seller: listing.seller,
          currentOwner: listing.currentOwner,
          // keep raw on-chain price (tinybars) for exact payment math and a human display value
          priceRaw: listing.price, // bigint in tinybars
          price: parseFloat(ethers.formatUnits(listing.price, 8)), // HBAR human-friendly
          isActive: listing.isActive,
          location: listing.info.location,
          gpsCoordinates: listing.info.gpsCoordinates,
          areaSize: Number(listing.info.areaSize),
          ipfsDeedHash: listing.info.ipfsDeedHash,
        };
        setForest(parsed);
      } catch (err) {
        console.error(err);
        setError("Failed to load forest listing.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchForest();
  }, [id]);

  // Buy forest token
  const handleBuy = async () => {
    if (!window.ethereum) return alert("MetaMask is required!");

    try {
      setBuying(true);

      // --- Get Hedera ID from company contract ---
      setStatusMessage("Fetching your company details...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const companyContract = new ethers.Contract(COMPANY_ADDRESS, CompanyABI, signer);
      const address = await signer.getAddress();
      const companyDetails = await companyContract.getCompanyDetails(address);
      console.log(companyDetails);
      if (!companyDetails.isRegistered) {
        throw new Error("Your company is not registered. Please register to make a purchase.");
      }
      const buyerHederaId = companyDetails.hederaAccountId;

      // --- Ethereum transaction ---
      setStatusMessage("Waiting for MetaMask confirmation...");
      const forestContract = new ethers.Contract(FOREST_CONTRACT_ADDRESS, ForestABI, signer);
      // Use exact on-chain tinybars value (priceRaw) to avoid float rounding issues
      const totalTinybars = BigInt(forest.priceRaw); // buying one area
      const tx = await forestContract.buyForestArea(forest.listingId, { value: totalTinybars });
      setTxHash(tx.hash);
      setStatusMessage("Processing transaction...");
      const receipt = await tx.wait();
      console.log("✅ Hedera transaction successful:", receipt.hash);

      // --- Backend Hedera workflow ---
      setStatusMessage("Minting your Hedera NFT deed...");
      const payload = {
        buyerHederaId,
        ethereumTxHash: receipt.hash,
        buyerEthAddress: address,
        location: forest.location,
        areaSize: forest.areaSize,
        price: forest.price,
        ipfsDeedHash: forest.ipfsDeedHash,
      };

      const response = await axios.post(`${BACKEND_URL}/api/tokenize-forest-purchase`, payload);
      if (!response.data.success) {
        throw new Error(response.data.error || "Backend tokenization failed.");
      }
      console.log("✅ Hedera tokenization successful:", response.data);

      setStatusMessage("Purchase complete!");
      setShowModal(true);

      // Auto-hide modal and navigate to profile
      setTimeout(() => {
        setShowModal(false);
        navigate("/profile");
      }, 5000);

    } catch (err) {
      console.error("Purchase failed:", err);
      alert(`❌ Transaction failed: ${err.message}`);
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
          <h1 className="text-3xl font-bold">Buy Forest Token #{forest.listingId}</h1>
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
            <p className="text-slate-300 text-sm">Price</p>
            <p className="font-mono text-white">{forest.price} HBAR</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-300 text-sm">Current Owner</p>
            <p>{forest.currentOwner}</p>
          </div>
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
          disabled={!forest.isActive || buying}
          className={`w-full py-3 text-lg font-bold rounded-lg transition-all ${
            forest.isActive
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          {buying ? statusMessage : forest.isActive ? "Buy Forest Token" : "Sold"}
        </button>

        {txHash && (
          <p className="mt-4 text-sm text-emerald-300">
            Transaction Hash:{" "}
            <a
              href={`https://testnet.hashio.io/api/${txHash}`}
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
              <p className="text-sm">Your forest token is now yours.</p>
              <button
                onClick={() => navigate(`/forest/${forest.listingId}`)}
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
