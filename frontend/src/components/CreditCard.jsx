import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  TreePine,
  Factory,
  TrendingDown,
} from "lucide-react";

export function CreditCard({ credit }) {
  const navigate = useNavigate();

  // Map blockchain data to UI properties with fallbacks
  const mappedCredit = {
    id: credit.id || "0",
    title: credit.projectName || `Project ${credit.id}`,
    location: credit.projectRegion || "Unknown",
    co2Reduction: credit.amount || 0,
    realDataSource: credit.accreditedRegistry || "Unknown Registry",
    rating: "4.8", // Default rating
    vintage: credit.creditVintageYear || new Date().getFullYear(),
    availableCredits: credit.amount || 0,
    totalCredits: credit.amount || 0,
    // UPDATED: Price logic
    price: credit.price
      ? credit.price
      : credit.pricePerCredit !== undefined
      ? `${credit.pricePerCredit.toFixed(4)} HBAR`
      : credit.pricePerShare !== undefined // <-- Fixed from pricePerHectare
      ? `${credit.pricePerShare.toFixed(4)} HBAR`
      : "N/A",
    priceChange: 0,
    type: credit.type || "carbon",
    verified: credit.isVerified || false,
    image: getDefaultImage(credit.type),
    companyId: credit.seller || "",
    seller: credit.seller || "",
    registryUrl: credit.registryUrl || "",
    serialNumber: credit.creditSerialNumber || "",
    parisCompliant: credit.parisAgreementCompliant || false,
    hostCountryAuth: credit.hostCountryAuthorization || false,
    areaSize: credit.areaSize || null,
    ipfsDeedHash: credit.ipfsDeedHash || "",
    currentOwner: credit.currentOwner || "",
    // --- NEW: Forest-specific data ---
    regenerationScore: credit.regenerationScore || 0,
    baselineSequestration: credit.baselineSequestration || 0,
    potentialSequestration: credit.potentialSequestration || 0,
    projectCountry: credit.projectCountry || "",
  };

  function getDefaultImage(type) {
    return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop";
  }

  const getPriceColor = (change) => {
    if (change > 0) return "text-[#40916c]";
    if (change < 0) return "text-red-500";
    return "text-[#3a5a40]";
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#3a5a40]/20 hover:border-[#40916c] transition-all duration-300 hover:shadow-2xl hover:shadow-[#40916c]/10">
      <div className="relative">
        <img
          src={mappedCredit.image}
          alt={mappedCredit.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1497436072909-f5e4be8af9c6?w=400&h=300&fit=crop";
          }}
        />
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <div
            className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
              mappedCredit.type === "carbon"
                ? "bg-[#3a5a40]/80 text-[#26e897]"
                : "bg-[#40916c]/80 text-white"
            }`}
          >
            {mappedCredit.type === "carbon" ? (
              <Factory className="h-3 w-3" />
            ) : (
              <TreePine className="h-3 w-3" />
            )}
            <span>
              {mappedCredit.type === "carbon"
                ? "Carbon Credit"
                : "Forest Token"}
            </span>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          {mappedCredit.verified && (
            <div className="bg-[#40916c] text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Verified</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-extrabold text-[#1b4332] mb-2">
          {mappedCredit.title}
        </h3>

        <div className="flex items-center text-[#3a5a40] text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>
            {mappedCredit.type === "carbon"
              ? `${mappedCredit.location}, ${
                  mappedCredit.projectCountry || "Unknown"
                } • ${mappedCredit.co2Reduction.toLocaleString()} tons CO₂`
              : `Region: ${mappedCredit.location}, 
                   Area: ${
                     mappedCredit.areaSize
                       ? mappedCredit.areaSize.toLocaleString() + " sq. m"
                       : "Unknown"
                   }`}
          </span>
        </div>

        {mappedCredit.type === "carbon" && (
          <div className="mb-3">
            <div className="text-xs text-[#40916c] bg-[#b7e4c7]/30 px-2 py-1 rounded inline-block font-semibold">
              📊 {mappedCredit.realDataSource}
            </div>
          </div>
        )}

        {/* Blockchain-specific info */}
        <div className="mb-3 space-y-1">
          {mappedCredit.serialNumber && (
            <div className="text-xs text-[#3a5a40]">
              Serial: {mappedCredit.serialNumber}
            </div>
          )}
          <div className="flex items-center space-x-4 text-xs">
            {mappedCredit.parisCompliant && (
              <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded font-semibold">
                Paris Agreement
              </span>
            )}
            {mappedCredit.hostCountryAuth && (
              <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded font-semibold">
                Host Country Auth
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 mr-1" />
            <span className="text-sm font-bold">{mappedCredit.rating}</span>
          </div>
          <div className="flex items-center text-[#3a5a40] text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{mappedCredit.vintage}</span>
          </div>
        </div>

        {mappedCredit.type === "forest" && mappedCredit.ipfsDeedHash && (
          <div className="mb-3 text-[#3a5a40] text-sm">
            <a
              href={mappedCredit.ipfsDeedHash}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#40916c] font-semibold"
            >
              View IPFS Deed
            </a>
          </div>
        )}

        {/* --- NEW: Forest Data Block --- */}
        {mappedCredit.type === "forest" && (
          <div className="border-t border-[#3a5a40]/10 mt-4 pt-4 mb-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#3a5a40] flex items-center">
                <Star className="w-4 h-4 mr-1.5 text-yellow-500" />
                Regen Score
              </span>
              <span className="font-bold text-yellow-500">
                {mappedCredit.regenerationScore} / 1000
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#3a5a40] flex items-center">
                <TrendingDown className="w-4 h-4 mr-1.5 text-blue-500" />
                Baseline
              </span>
              <span className="font-semibold text-[#3a5a40]">
                {mappedCredit.baselineSequestration.toLocaleString()}
                <span className="text-[#3a5a40]/60 text-xs"> CO2/yr</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#3a5a40] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1.5 text-[#40916c]" />
                Potential
              </span>
              <span className="font-bold text-[#40916c]">
                {mappedCredit.potentialSequestration.toLocaleString()}
                <span className="text-[#3a5a40]/60 text-xs"> CO2/yr</span>
              </span>
            </div>
          </div>
        )}
        {/* --- END: New Block --- */}

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-extrabold text-[#1b4332]">
              {mappedCredit.price}
            </div>
            <div className="text-[#3a5a40] text-sm">
              {/* UPDATED: Price label */}
              {mappedCredit.type === "carbon" ? "per ton CO₂" : "per share"}
            </div>
          </div>
          <div
            className={`flex items-center space-x-1 ${getPriceColor(
              mappedCredit.priceChange
            )}`}
          >
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {mappedCredit.priceChange > 0 ? "+" : ""}
              {mappedCredit.priceChange}%
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          {mappedCredit.type === "carbon" ? (
            <>
              <button
                onClick={() => navigate(`/company/${mappedCredit.seller}`)}
                className="flex-1 bg-[#b7e4c7]/30 text-[#1b4332] py-2 px-4 rounded-full font-bold hover:bg-[#40916c]/10 transition-all"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  navigate(`/purchase/${mappedCredit.id}`);
                  console.log(
                    "Navigating to purchase page for carbon credit:",
                    mappedCredit.id
                  );
                }}
                className="flex-1 bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white py-2 px-4 rounded-full font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all"
              >
                Buy Credits
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate(`/forest/${mappedCredit.id}`)}
                className="flex-1 bg-[#b7e4c7]/30 text-[#1b4332] py-2 px-4 rounded-full font-bold hover:bg-[#40916c]/10 transition-all"
              >
                Forest Profile
              </button>
              <button
                onClick={() => {
                  navigate(`/buy-forest/${mappedCredit.id}`);
                  console.log(
                    "Navigating to purchase page for forest token:",
                    mappedCredit.id
                  );
                }}
                className="flex-1 bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white py-2 px-4 rounded-full font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all"
              >
                Buy Forest Token
              </button>
            </>
          )}
        </div>

        {mappedCredit.registryUrl && mappedCredit.registryUrl !== "" && (
          <div className="mt-3 pt-3 border-t border-[#3a5a40]/10">
            <a
              href={mappedCredit.registryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#40916c] hover:text-[#1b4332] transition-colors font-semibold"
            >
              View on Registry →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}