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
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import ForestABI from "../abi/ForestTokenMarketplace.json";

const FOREST_CONTRACT_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "0xD8a0C3B0CB1FDc61262772eE502a97C74dbA86B9";
const RPC_URL = "https://testnet.hashio.io/api";
const HBAR_TO_TINYBAR = 100_000_000n;

// Reusable component for displaying data points
const InfoCard = ({ label, value, icon: Icon, valueClass = "text-[#1b4332]" }) => (
  <div className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-[#3a5a40]/10 shadow-sm">
    <p className="text-[#3a5a40] text-sm mb-1 flex items-center font-semibold">
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
  <div className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-[#3a5a40]/10 shadow-sm">
    <p className="text-[#3a5a40] text-sm mb-1 flex items-center font-semibold">
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {label}
    </p>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#40916c] hover:text-[#1b4332] underline break-words font-semibold"
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea] text-[#40916c]">
        <LoadingSpinner message="Loading forest details..." />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea] text-red-500">
        <ErrorMessage message={error} />
      </div>
    );
  if (!forest) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea] text-[#0f2d1c] py-16 px-4 overflow-hidden">
      {/* --- Subtle Gradient Green Backgrounds (Home style) --- */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)" }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)" }} />
        <div className="absolute left-1/2 top-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20"
          style={{ background: "conic-gradient(from 90deg at 50% 50%, #d8f3dc 0deg, #74c69d 120deg, #b7e4c7 240deg, #d8f3dc 360deg)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-[#40916c] hover:text-[#1b4332] mb-4 md:mb-0 font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Marketplace</span>
          </button>
          <button
            onClick={() => navigate(`/buy-forest/${forest.id}`)}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white px-6 py-3 rounded-full font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Buy Shares</span>
          </button>
        </div>

        <div className="flex items-center mb-8">
          <TreePine className="h-12 w-12 text-[#40916c] mr-4" />
          <div>
            <h1 className="text-4xl font-extrabold text-[#1b4332] tracking-tight">{forest.location}</h1>
            <p className="text-[#3a5a40] text-lg">Forest Area #{forest.id}</p>
          </div>
        </div>

        {/* --- Main Details --- */}
        <h2 className="text-2xl font-bold text-[#1b4332] mb-4">Core Details</h2>
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
            value={`${forest.areaSize.toLocaleString()} sq. m`}
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
            valueClass={forest.active ? "text-green-500" : "text-red-500"}
          />
        </div>

        {/* --- Share & Price Details --- */}
        <h2 className="text-2xl font-bold text-[#1b4332] mb-4">Market Details</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <InfoCard
            label="Current Price / Share"
            value={`${forest.pricePerShare} HBAR`}
            icon={ShoppingCart}
            valueClass="text-[#40916c]"
          />
          <InfoCard
            label="Shares Available"
            value={forest.sharesAvailable.toLocaleString()}
            icon={PieChart}
            valueClass="text-yellow-500"
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
        <h2 className="text-2xl font-bold text-[#1b4332] mb-4">Sequestration Data</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <InfoCard
            label="Regeneration Score"
            value={`${forest.regenerationScore} / 1000`}
            icon={Star}
            valueClass="text-yellow-500"
          />
          <InfoCard
            label="Baseline Sequestration"
            value={`${forest.baseline.toLocaleString()} CO2/yr`}
            icon={TrendingDown}
            valueClass="text-blue-500"
          />
          <InfoCard
            label="Potential Sequestration"
            value={`${forest.potential.toLocaleString()} CO2/yr`}
            icon={TrendingUp}
            valueClass="text-[#40916c]"
          />
        </div>

        {/* --- Links & Status --- */}
        <h2 className="text-2xl font-bold text-[#1b4332] mb-4">Links & Status</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <LinkCard
            label="Deed (IPFS)"
            href={forest.ipfsDeedHash}
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
        <h2 className="text-2xl font-bold text-[#1b4332] mb-4">Fractional Owners</h2>
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-[#3a5a40]/10 overflow-hidden shadow-sm">
          <div className="flex p-4 border-b border-[#3a5a40]/10 bg-white/80">
            <div className="w-2/3 font-semibold text-[#3a5a40]">Owner Address</div>
            <div className="w-1/3 font-semibold text-[#3a5a40] text-right">Shares Held</div>
          </div>
          {forest.ownersList.length === 0 ? (
            <div className="p-4 text-[#3a5a40] text-center">
              No shares have been sold for this forest yet.
            </div>
          ) : (
            forest.ownersList.map((owner, idx) => (
              <div
                key={idx}
                className="flex p-4 border-b border-[#3a5a40]/10 last:border-b-0 hover:bg-[#b7e4c7]/20"
              >
                <div className="w-2/3 text-[#40916c] font-mono text-sm break-all">
                  {owner.holder}
                </div>
                <div className="w-1/3 text-[#1b4332] font-mono text-right">
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