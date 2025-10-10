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
    price: credit.price
      ? credit.price
      : credit.pricePerCredit !== undefined
      ? `${credit.pricePerCredit.toFixed(4)} HBAR`
      : credit.pricePerHectare !== undefined
      ? `${credit.pricePerHectare.toFixed(4)} HBAR`
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
  };

  function getDefaultImage(type) {
    return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop";
  }

  const getPriceColor = (change) => {
    if (change > 0) return "text-emerald-400";
    if (change < 0) return "text-red-400";
    return "text-slate-300";
  };

  return (
    <div className="bg-slate-800/70 backdrop-blur-md rounded-xl overflow-hidden border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
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
            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
              mappedCredit.type === "carbon"
                ? "bg-slate-900/80 text-slate-200"
                : "bg-emerald-900/80 text-emerald-200"
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
            <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Verified</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          {mappedCredit.title}
        </h3>

        <div className="flex items-center text-slate-400 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>
            {mappedCredit.type === "carbon"
              ? `${mappedCredit.location}, ${
                  mappedCredit.projectCountry || "Unknown"
                } • ${mappedCredit.co2Reduction.toLocaleString()} tons CO₂`
              : `Region: ${mappedCredit.location},    
                  Area: ${mappedCredit.areaSize || "Unknown"} ha`}
          </span>
        </div>

        {mappedCredit.type === "carbon" && (
          <div className="mb-3">
            <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">
              📊 {mappedCredit.realDataSource}
            </div>
          </div>
        )}

        {/* Blockchain-specific info */}
        <div className="mb-3 space-y-1">
          {mappedCredit.serialNumber && (
            <div className="text-xs text-slate-400">
              Serial: {mappedCredit.serialNumber}
            </div>
          )}
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            {mappedCredit.parisCompliant && (
              <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                Paris Agreement
              </span>
            )}
            {mappedCredit.hostCountryAuth && (
              <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded">
                Host Country Auth
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center text-slate-300">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm">{mappedCredit.rating}</span>
          </div>
          <div className="flex items-center text-slate-400 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{mappedCredit.vintage}</span>
          </div>
        </div>

        {mappedCredit.type === "forest" && mappedCredit.ipfsDeedHash && (
          <div className="mb-3 text-slate-400 text-sm">
            <a
              href={mappedCredit.ipfsDeedHash}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-emerald-400"
            >
              View IPFS Deed
            </a>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-white">
              {mappedCredit.price}
            </div>
            <div className="text-slate-400 texett-sm">
              {mappedCredit.type === "carbon" ? "per ton CO₂" : "per hectare"}
            </div>
          </div>
          <div
            className={`flex items-center space-x-1 ${getPriceColor(
              mappedCredit.priceChange
            )}`}
          >
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">
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
                className="flex-1 bg-slate-700/50 text-slate-300 py-2 px-4 rounded-lg font-medium hover:bg-slate-600/50 transition-all"
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
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                Buy Credits
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate(`/forest/${mappedCredit.id}`)}
                className="flex-1 bg-slate-700/50 text-slate-300 py-2 px-4 rounded-lg font-medium hover:bg-slate-600/50 transition-all"
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
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 px-4 rounded-lg font-medium  hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                Buy Forest Token
              </button>
            </>
          )}
        </div>

        {mappedCredit.registryUrl && mappedCredit.registryUrl !== "" && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <a
              href={mappedCredit.registryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View on Registry →
            </a>
          </div>
        )}

        {mappedCredit.type === "forest" && mappedCredit.currentOwner && (
          <div className="mt-2 text-slate-400 text-xs">
            Current Owner: {mappedCredit.currentOwner}
          </div>
        )}
      </div>
    </div>
  );
}
