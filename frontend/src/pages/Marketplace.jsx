import React, { useState, useEffect, useCallback } from "react";
import { Search, TreePine, Factory, BarChart3, Award, TrendingUp, Sparkles } from "lucide-react";
import { ethers } from "ethers";
import { CreditCard } from "../components/CreditCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";

// --- Load ABI from local files ---
import CONTRACT_ABI from "../abi/CarbonCreditMarketplace.json";
// UPDATED: Import new forest ABI
import FOREST_ABI from "../abi/ForestTokenMarketplace.json";

const CARBON_CONTRACT_ADDRESS =
  import.meta.env.VITE_CARBON_CONTRACT_ADDRESS ||
  "0x2b22Ed957d4A0D7cF11Fe049e936a94b2EF05Fb6";
const FOREST_CONTRACT_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "0xD8a0C3B0CB1FDc61262772eE502a97C74dbA86B9"; 

const RPC_URL = "https://testnet.hashio.io/api";

// UPDATED: Use BigInt for HBAR constant
const HBAR_TO_TINYBAR = 100_000_000n;

// UPDATED: New fetchForestData helper for the new contract
const fetchForestData = async (contract, id) => {
  try {
    const [forest, remaining] = await Promise.all([
      contract.forests(id),
      contract.remainingShares(id),
    ]);

    if (!forest.active || forest.forestId.toString() === "0") {
      return null;
    }

    const regenScore = Number(forest.regenerationScore);
    const BASE_PRICE_TINYBAR = 100_000n;
    let pricePerShareTinybar;

    if (regenScore > 0) {
      pricePerShareTinybar = (BigInt(regenScore) * BASE_PRICE_TINYBAR) / 10n;
    } else {
      pricePerShareTinybar = BASE_PRICE_TINYBAR;
    }

    const pricePerShareHBAR = parseFloat(
      ethers.formatUnits(pricePerShareTinybar, 8)
    );
    const totalShares = Number(forest.totalShares);
    const sharesAvailable = Number(remaining);
    const sharesSold = totalShares - sharesAvailable;

    return {
      id: id.toString(),
      seller: "N/A (Direct Sale)",
      currentOwner: "N/A (Fractional)",
      pricePerShare: pricePerShareHBAR,
      isActive: forest.active,
      projectName: forest.info.location || `Forest #${id}`,
      projectRegion: forest.info.location || "Unknown",
      areaSize: Number(forest.info.areaSize),
      ipfsDeedHash: forest.info.ipfsDeedHash,
      projectCountry: "Unknown",
      forestType: "Dynamic Reforestation",
      conservationStatus: `Regen Score: ${regenScore}`, // This was already here
      type: "forest",
      totalShares: totalShares,
      sharesAvailable: sharesAvailable,
      sharesSold: sharesSold,
      regenerationScore: regenScore, 
      
      baselineSequestration: Number(forest.baselineSequestrationPerYear),
      potentialSequestration: Number(forest.potentialSequestrationPerYear),
      htsTokenId: forest.htsTokenId, // Pass the token ID
      // --- END OF NEW DATA ---
    };
  } catch (err) {
    console.error(`Error fetching forest data for ID ${id}:`, err);
    return null;
  }
};


function Marketplace({ onViewCompany }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalCredits: 0,
    activeProjects: 0,
    forestActive: 0,
    totalValueLocked: 0,
    verificationRate: 0,
  });
  // For animated background
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!CARBON_CONTRACT_ADDRESS || !FOREST_CONTRACT_ADDRESS || !RPC_URL) {
        throw new Error(
          "Missing contract addresses or RPC URL. Check your .env configuration."
        );
      }

      const provider = new ethers.JsonRpcProvider(RPC_URL);

      // --- Carbon Marketplace (Unchanged) ---
      const carbonContract = new ethers.Contract(
        CARBON_CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
      const activeCarbonIds =
        await carbonContract.getActiveCarbonCreditListings();
      const carbonListings = await Promise.all(
        activeCarbonIds.map(async (idBN) => {
          const id = idBN.toString();
          const listing = await carbonContract.getListingDetails(id);
          const basicInfo = listing[5];
          const verificationInfo = listing[6];
          const creditInfo = listing[7];

          return {
            id,
            seller: listing[1],
            amount: Number(listing[2]),
            pricePerCredit: parseFloat(ethers.formatUnits(listing[3], 8)),
            isActive: listing[4],
            projectName: basicInfo[0] || `Project ${id}`,
            projectType: basicInfo[1] || "Carbon Credit",
            projectRegion: basicInfo[2] || "Unknown",
            projectCountry: basicInfo[3] || "Unknown",
            projectAddress: basicInfo[4] || "",
            registryUrl: basicInfo[5] || "",
            accreditedRegistry: verificationInfo[0] || "Unknown Registry",
            registryStandard: verificationInfo[1] || "",
            hostCountryAuthorization: verificationInfo[2] || false,
            parisAgreementCompliant: verificationInfo[4] || false,
            isVerified: verificationInfo[6] || false,
            creditVintageYear: Number(creditInfo[0]),
            creditSerialNumber: creditInfo[1] || "",
            type: "carbon",
          };
        })
      );

      // --- Forest Marketplace (UPDATED) ---
      const forestContract = new ethers.Contract(
        FOREST_CONTRACT_ADDRESS, // Uses new address
        FOREST_ABI, // Uses new ABI
        provider
      );
      const nextIdBN = await forestContract.nextForestId();
      const nextId = Number(nextIdBN);
      const forestPromises = [];

      for (let i = 1; i < nextId; i++) {
        // fetchForestData helper is now updated for the new contract
        forestPromises.push(fetchForestData(forestContract, i));
      }
      const validForestListings = (await Promise.all(forestPromises)).filter(
        Boolean
      );

      // --- Combine both listings ---
      const fetchedListings = [...carbonListings, ...validForestListings];
      setListings(fetchedListings);

      // --- MODIFIED: Analytics ---
      const totalCredits = carbonListings.reduce((sum, l) => sum + l.amount, 0);
      const activeProjects = carbonListings.length + validForestListings.length;

      // Calculate TVL for carbon credits
      const carbonTVL = carbonListings.reduce(
        (sum, l) => sum + l.amount * l.pricePerCredit,
        0
      );

      // UPDATED: Calculate TVL for forests (value of *sold* shares)
      const forestTVL = validForestListings.reduce((sum, f) => {
        // We now use the 'sharesSold' property from the new fetchForestData
        return sum + f.sharesSold * f.pricePerShare;
      }, 0);

      const verifiedCount = carbonListings.filter((l) => l.isVerified).length;
      const carbonOnlyVerified =
        carbonListings.length > 0
          ? (verifiedCount / carbonListings.length) * 100
          : 0;

      setAnalytics({
        totalCredits,
        activeProjects,
        totalValueLocked: carbonTVL + forestTVL,
        verificationRate: Math.round(carbonOnlyVerified),
      });
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(err.message || "Failed to fetch listings.");
    } finally {
      setLoading(false);
    }
  }, []); // useCallback dependency list is empty, correct for this logic

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredCredits = listings.filter((credit) => {
    const matchesSearch =
      credit.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credit.projectCountry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credit.projectType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credit.accreditedRegistry
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === "all" || credit.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea]">
        <LoadingSpinner message="Loading listings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea]">
        <ErrorMessage message={error} />
      </div>
    );
  }


  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea] min-h-screen text-[#0f2d1c]">
      {/* --- Subtle Gradient Green Backgrounds (copied from Home) --- */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20"
          style={{
            background:
              "conic-gradient(from 90deg at 50% 50%, #d8f3dc 0deg, #74c69d 120deg, #b7e4c7 240deg, #d8f3dc 360deg)",
          }}
        />
      </div>
      {/* --- End Gradient Backgrounds --- */}

      {/* Background layers (animated sunlight, leaves) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <div
          className="absolute w-[900px] h-[900px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,248,225,0.3), transparent 70%)",
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 70% 80%, rgba(74,103,65,0.2), transparent 80%)",
            transform: `translate(-${mousePosition.x * 0.01}px, -${mousePosition.y * 0.01}px)`,
          }}
        />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Analytics Dashboard */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="group p-8 rounded-3xl bg-white/50 backdrop-blur-xl border border-[#3a5a40]/20 hover:border-[#3a5a40]/40 transition-all shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-[#4a6741]" />
                <span className="text-lg font-semibold text-[#1b4332]">Total Credits</span>
              </div>
              <div className="text-3xl font-extrabold text-[#1b4332]">{analytics.totalCredits.toLocaleString()}</div>
            </div>
            <div className="group p-8 rounded-3xl bg-white/50 backdrop-blur-xl border border-[#3a5a40]/20 hover:border-[#3a5a40]/40 transition-all shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-[#4a6741]" />
                <span className="text-lg font-semibold text-[#1b4332]">Active Listings</span>
              </div>
              <div className="text-3xl font-extrabold text-[#1b4332]">{analytics.activeProjects}</div>
            </div>
            <div className="group p-8 rounded-3xl bg-white/50 backdrop-blur-xl border border-[#3a5a40]/20 hover:border-[#3a5a40]/40 transition-all shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-[#4a6741]" />
                <span className="text-lg font-semibold text-[#1b4332]">Total Value Locked</span>
              </div>
              <div className="text-3xl font-extrabold text-[#1b4332]">
                {analytics.totalValueLocked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HBAR
              </div>
            </div>
            <div className="group p-8 rounded-3xl bg-white/50 backdrop-blur-xl border border-[#3a5a40]/20 hover:border-[#3a5a40]/40 transition-all shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-[#4a6741]" />
                <span className="text-lg font-semibold text-[#1b4332]">Verification Rate</span>
              </div>
              <div className="text-3xl font-extrabold text-[#1b4332]">{analytics.verificationRate}%</div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="mb-12">
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-[#3a5a40]/20 p-8 flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3a5a40] h-5 w-5" />
              <input
                type="text"
                placeholder="Search projects, locations, or issuers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-[#3a5a40]/20 rounded-lg text-[#1b4332] placeholder-[#3a5a40]/60 focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-6 py-2 rounded-full font-bold text-lg transition-all ${filterType === 'all' ? 'bg-gradient-to-r from-[#1b4332] to-[#3a5a40] text-white shadow-lg' : 'bg-white/70 border border-[#3a5a40]/20 text-[#1b4332] hover:bg-[#1b4332]/10'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('carbon')}
                className={`px-6 py-2 rounded-full font-bold text-lg flex items-center gap-2 transition-all ${filterType === 'carbon' ? 'bg-gradient-to-r from-[#1b4332] to-[#3a5a40] text-white shadow-lg' : 'bg-white/70 border border-[#3a5a40]/20 text-[#1b4332] hover:bg-[#1b4332]/10'}`}
              >
                <Factory className="h-5 w-5" /> Carbon Credits
              </button>
              <button
                onClick={() => setFilterType('forest')}
                className={`px-6 py-2 rounded-full font-bold text-lg flex items-center gap-2 transition-all ${filterType === 'forest' ? 'bg-gradient-to-r from-[#1b4332] to-[#3a5a40] text-white shadow-lg' : 'bg-white/70 border border-[#3a5a40]/20 text-[#1b4332] hover:bg-[#1b4332]/10'}`}
              >
                <TreePine className="h-5 w-5" /> Forest Tokens
              </button>
            </div>
          </div>
        </section>

        {/* Credits Grid */}
        <section>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCredits.map((credit) => (
              <CreditCard
                key={`${credit.type}-${credit.id}`}
                credit={{
                  ...credit,
                  price: credit.pricePerCredit
                    ? `${credit.pricePerCredit.toFixed(4)} HBAR`
                    : credit.pricePerShare
                    ? `${credit.pricePerShare.toFixed(4)} HBAR`
                    : 'N/A',
                }}
                onViewCompany={onViewCompany}
              />
            ))}
          </div>
          {filteredCredits.length === 0 && (
            <div className="text-center py-12 text-[#3a5a40]/70 text-xl">
              No credits found. Try adjusting your search or filters.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export { Marketplace };