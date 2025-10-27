import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ethers } from "ethers";
import {
  TreePine,
  ArrowLeft,
  MapPin,
  Globe,
  Ruler,
  FileText,
  Shield,
  Award,
  PieChart,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  Clock,
  Database,
  Link as LinkIcon, // Alias Link to avoid name clash
} from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner"; // Assuming you have this
import { ErrorMessage } from "./ErrorMessage"; // Assuming you have this

// UPDATED: Import new ABI
import ForestABI from "../abi/ForestTokenMarketplace.json";

// UPDATED: Use new .env variable and address
const FOREST_CONTRACT_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "0xD8a0C3B0CB1FDc61262772eE502a97C74dbA86B9";
const RPC_URL = "https://testnet.hashio.io/api";
const HBAR_TO_TINYBAR = 100_000_000n;

// Reusable component for displaying data points
const InfoCard = ({ label, value, icon: Icon, valueClass = "text-white" }) => (
  <div className="p-6 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50">
    <p className="text-slate-400 text-sm mb-1 flex items-center">
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {label}
    </p>
    <p className={`text-xl font-semibold break-words ${valueClass}`}>
      {value}
    </p>
  </div>
);

// Reusable component for data links
const LinkCard = ({ label, href, icon: Icon, linkText }) => (
  <div className="p-6 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50">
    <p className="text-slate-400 text-sm mb-1 flex items-center">
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {label}
    </p>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-emerald-400 hover:text-emerald-300 underline break-words"
    >
      {linkText || "View Link"}
    </a>
  </div>
);

export function ForestProfile() {
  const { id } = useParams(); // /forest/:id
  const [forest, setForest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchForestDetails() {
      try {
        setLoading(true);
        setError(null);

        if (!FOREST_CONTRACT_ADDRESS || !RPC_URL) {
          throw new Error("Missing forest contract address or RPC URL");
        }

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          FOREST_CONTRACT_ADDRESS,
          ForestABI,
          provider
        );

        // --- UPDATED: Fetch all data in parallel ---
        const [forestData, remaining, ownersData] = await Promise.all([
          contract.forests(id),
          contract.remainingShares(id),
          contract.getOwners(id), // Fetches [holders, shares]
        ]);

        if (forestData.forestId.toString() === "0") {
          throw new Error("Forest area not found.");
        }

        // --- Calculate current price (same logic as Marketplace) ---
        const regenScore = Number(forestData.regenerationScore);
        const BASE_PRICE_TINYBAR = 100_000n; // 0.001 HBAR
        let pricePerShareTinybar;

        if (regenScore > 0) {
          pricePerShareTinybar = (BigInt(regenScore) * BASE_PRICE_TINYBAR) / 10n;
        } else {
          pricePerShareTinybar = BASE_PRICE_TINYBAR;
        }

        // --- Parse all data into a clean object ---
        const totalShares = Number(forestData.totalShares);
        const sharesAvailable = Number(remaining);
        const [holders, shares] = ownersData;

        const parsed = {
          id: Number(forestData.forestId),
          active: forestData.active,
          htsTokenId: forestData.htsTokenId.toString(),
          serial: Number(forestData.serial),
          // Info struct
          location: forestData.info.location,
          gpsCoordinates: forestData.info.gpsCoordinates,
          areaSize: Number(forestData.info.areaSize),
          ipfsDeedHash: forestData.info.ipfsDeedHash,
          // Share data
          totalShares: totalShares,
          sharesAvailable: sharesAvailable,
          sharesSold: totalShares - sharesAvailable,
          // Price data
          pricePerShare: ethers.formatUnits(pricePerShareTinybar, 8),
          // Sequestration data
          regenerationScore: regenScore,
          baseline: Number(forestData.baselineSequestrationPerYear),
          potential: Number(forestData.potentialSequestrationPerYear),
          // Yield data
          accumulatedYield: forestData.accumulatedYield.toString(),
          lastUpdated: new Date(
            Number(forestData.lastUpdated) * 1000
          ).toLocaleString(),
          // Owners data
          ownersList: holders.map((holder, index) => ({
            holder: holder,
            shares: Number(shares[index]),
          })),
        };

        setForest(parsed);
      } catch (err) {
        console.error("❌ Error fetching forest details:", err);
        setError(err.message || "Failed to load forest details.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchForestDetails();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900 text-emerald-400">
        <LoadingSpinner />
        <span className="ml-2">Loading forest details...</span>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900 text-red-500">
        <ErrorMessage message={error} />
      </div>
    );
  if (!forest) return null;

  return (
    <div className="relative min-h-screen bg-slate-900 text-white py-16 px-4">
      {/* Forest background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1632834784573-f212a0b4586b?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          zIndex: 0,
        }}
      ></div>

      {/* Content container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 mb-4 md:mb-0"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Marketplace</span>
          </button>
          <button
            onClick={() => navigate(`/buy-forest/${forest.id}`)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Buy Shares</span>
          </button>
        </div>

        <div className="flex items-center mb-8">
          <TreePine className="h-12 w-12 text-emerald-400 mr-4" />
          <div>
            <h1 className="text-4xl font-bold">{forest.location}</h1>
            <p className="text-slate-300 text-lg">Forest Area #{forest.id}</p>
          </div>
        </div>

        {/* --- Main Details --- */}
        <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
          Core Details
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <InfoCard
            label="Location"
            value={forest.location}
            icon={MapPin}
          />
          <InfoCard
            label="GPS Coordinates"
            value={forest.gpsCoordinates}
            icon={Globe}
          />
          <InfoCard
            label="Area Size"
            value={`${forest.areaSize.toLocaleString()} sq. m`} // UPDATED Unit
            icon={Ruler}
          />
          <InfoCard
            label="HTS Token ID"
            value={forest.htsTokenId}
            icon={Award}
          />
          <InfoCard
            label="NFT Serial"
            value={forest.serial.toLocaleString()}
            icon={Shield}
          />
          <InfoCard
            label="Active Status"
            value={forest.active ? "Active" : "Inactive"}
            icon={Shield}
            valueClass={forest.active ? "text-green-400" : "text-red-400"}
          />
        </div>

        {/* --- Share & Price Details --- */}
        <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
          Market Details
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <InfoCard
            label="Current Price / Share"
            value={`${forest.pricePerShare} HBAR`}
            icon={ShoppingCart}
            valueClass="text-emerald-400"
          />
          <InfoCard
            label="Shares Available"
            value={forest.sharesAvailable.toLocaleString()}
            icon={PieChart}
            valueClass="text-yellow-400"
          />
          <InfoCard
            label="Shares Sold"
            value={forest.sharesSold.toLocaleString()}
            icon={Users}
          />
          <InfoCard
            label="Total Shares"
            value={forest.totalShares.toLocaleString()}
            icon={PieChart}
          
          />
        </div>

        {/* --- Sequestration Data --- */}
        <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
          Sequestration Data
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <InfoCard
            label="Regeneration Score"
            value={`${forest.regenerationScore} / 1000`}
            icon={Star}
            valueClass="text-yellow-400"
          />
          <InfoCard
            label="Baseline Sequestration"
            value={`${forest.baseline.toLocaleString()} CO2/yr`}
            icon={TrendingDown}
            valueClass="text-blue-400"
          />
          <InfoCard
            label="Potential Sequestration"
            value={`${forest.potential.toLocaleString()} CO2/yr`}
            icon={TrendingUp}
            valueClass="text-emerald-400"
          />
        </div>

        {/* --- Links & Status --- */}
        <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
          Links & Status
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <LinkCard
            label="Deed (IPFS)"
            href={forest.ipfsDeedHash} // Use the direct link
            linkText="View IPFS Deed"
            icon={FileText}
          />
          <LinkCard
            label="HTS Token"
            href={`https://hashscan.io/testnet/token/${forest.htsTokenId}`}
            linkText="View on HashScan"
            icon={LinkIcon}
          />
          <InfoCard
            label="Last Data Update"
            value={forest.lastUpdated}
            icon={Clock}
          />
          <InfoCard
            label="Accumulated Yield (Raw)"
            value={forest.accumulatedYield.toLocaleString()}
            icon={Database}
          />
        </div>

        {/* --- Owners List --- */}
        <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
          Fractional Owners
        </h2>
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="flex p-4 border-b border-slate-700">
            <div className="w-2/3 font-semibold text-slate-300">
              Owner Address
            </div>
            <div className="w-1/3 font-semibold text-slate-300 text-right">
              Shares Held
            </div>
          </div>
          {forest.ownersList.length === 0 ? (
            <div className="p-4 text-slate-400 text-center">
              No shares have been sold for this forest yet.
            </div>
          ) : (
            forest.ownersList.map((owner, idx) => (
              <div
                key={idx}
                className="flex p-4 border-b border-slate-800 last:border-b-0 hover:bg-slate-700/30"
              >
                <div className="w-2/3 text-emerald-400 font-mono text-sm break-all">
                  {owner.holder}
                </div>
                <div className="w-1/3 text-white font-mono text-right">
                  {owner.shares.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}