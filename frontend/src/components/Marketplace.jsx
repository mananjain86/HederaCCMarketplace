import React, { useState, useEffect, useCallback } from "react";
import { Search, TreePine, Factory } from "lucide-react";
import { ethers } from "ethers";
import { CreditCard } from "./CreditCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";

// --- Load ABI from local files ---
import CONTRACT_ABI from "../abi/CarbonCreditMarketplace.json";
import ForestABI from "../abi/ForestTokenMarketplace.json";

const CARBON_CONTRACT_ADDRESS =
  import.meta.env.VITE_CARBON_CONTRACT_ADDRESS ||
  "0x2b22Ed957d4A0D7cF11Fe049e936a94b2EF05Fb6";
const FOREST_CONTRACT_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "0x9A0b748B6A706eAb1C4Bf8541684C1eE41F0031D";
const RPC_URL = "https://sepolia.infura.io/v3/034100fe6f094ec3a1d8bfeb5a3ae773";

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

      // --- Carbon Marketplace ---
      const carbonContract = new ethers.Contract(
        CARBON_CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
      const activeCarbonIds = await carbonContract.getActiveCarbonCreditListings();

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
            pricePerCredit: parseFloat(ethers.formatEther(listing[3])),
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

      // --- Forest Marketplace ---
      const forestContract = new ethers.Contract(
        FOREST_CONTRACT_ADDRESS,
        ForestABI,
        provider
      );
      const activeForestIds = await forestContract.getActiveListings();

      const forestListings = await Promise.all(
        activeForestIds.map(async (idBN) => {
          try {
            const id = idBN.toString();
            const listing = await forestContract.getListingDetails(id);

            // Forest info is mainly in listing[5]
            const infoRaw = listing[5] || {};
            const info = Array.isArray(infoRaw) ? infoRaw : infoRaw.info || [];

            return {
              id,
              seller: listing[1],
              currentOwner: listing[2],
              pricePerHectare: parseFloat(ethers.formatEther(listing[3] || 0)),
              isActive: listing[4] || false,
              projectName: info[0] || `Forest Project ${id}`,
              projectRegion: info[1] || "Unknown",
              areaSize: info[2] ? Number(info[2]) : null,
              ipfsDeedHash: info[3] || "",
              projectCountry: "Unknown",
              forestType: "General Forest",
              conservationStatus: "Unspecified",
              type: "forest",
            };
          } catch (err) {
            console.error(`Error fetching forest listing ${idBN}:`, err);
            return null;
          }
        })
      );

      const validForestListings = forestListings.filter(Boolean);

      // --- Combine both listings ---
      const fetchedListings = [...carbonListings, ...validForestListings];
      setListings(fetchedListings);

      // --- Analytics (carbon credits only) ---
      const totalCredits = carbonListings.reduce((sum, l) => sum + l.amount, 0);
      const activeProjects = carbonListings.length + validForestListings.length;
      const totalValueLocked = carbonListings.reduce(
        (sum, l) => sum + l.amount * l.pricePerCredit,
        0
      );
      const verifiedCount = carbonListings.filter((l) => l.isVerified).length;

      setAnalytics({
        totalCredits,
        activeProjects,
      
        totalValueLocked,
        verificationRate: activeProjects
          ? Math.round((verifiedCount / activeProjects) * 100)
          : 0,
      });
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(err.message || "Failed to fetch listings.");
    } finally {
      setLoading(false);
    }
  }, []);

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
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <LoadingSpinner />
        <p className="ml-3 text-emerald-400">Loading listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="text-2xl font-bold text-emerald-400">
            {analytics.totalCredits.toLocaleString()}
          </div>
          <div className="text-slate-400">Total Credits Available</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="text-2xl font-bold text-emerald-400">
            {analytics.activeProjects}
          </div>
          <div className="text-slate-400">Active Listings</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="text-2xl font-bold text-emerald-400">
            {analytics.totalValueLocked.toFixed(2)} ETH
          </div>
          <div className="text-slate-400">Total Value Locked</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="text-2xl font-bold text-emerald-400">
            {analytics.verificationRate}%
          </div>
          <div className="text-slate-400">Verification Rate</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 mb-8 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search projects, locations, or issuers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === "all"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("carbon")}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                filterType === "carbon"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
              }`}
            >
              <Factory className="h-4 w-4" />
              <span>Carbon Credits</span>
            </button>
            <button
              onClick={() => setFilterType("forest")}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                filterType === "forest"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
              }`}
            >
              <TreePine className="h-4 w-4" />
              <span>Forest Tokens</span>
            </button>
          </div>
        </div>
      </div>

      {/* Credits Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCredits.map((credit) => (
          <CreditCard
            key={`${credit.type}-${credit.id}`} 
            credit={{
              ...credit,
              price: credit.pricePerCredit
                ? `${credit.pricePerCredit.toFixed(4)} ETH`
                : credit.pricePerHectare
                ? `${credit.pricePerHectare.toFixed(4)} ETH`
                : "N/A",
            }}
            onViewCompany={onViewCompany}
          />
        ))}
      </div>

      {filteredCredits.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No credits found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  );
}

export { Marketplace };
