import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ethers } from "ethers";
import { TreePine, ArrowLeft } from "lucide-react";

import ForestABI from "../abi/ForestTokenMarketplace.json";

const FOREST_CONTRACT_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "0x9A0b748B6A706eAb1C4Bf8541684C1eE41F0031D";
const RPC_URL = "https://testnet.hashio.io/api";

export function ForestProfile() {
  const { id } = useParams(); // /forest/:id → listingId
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

        const listing = await contract.getListingDetails(id);

        const parsed = {
          listingId: Number(listing.listingId),
          seller: listing.seller,
          currentOwner: listing.currentOwner,
          price: ethers.formatUnits(listing.price,8),
          isActive: listing.isActive,
          location: listing.info.location,
          gpsCoordinates: listing.info.gpsCoordinates,
          areaSize: Number(listing.info.areaSize),
          ipfsDeedHash: listing.info.ipfsDeedHash,
        };

        setForest(parsed);
      } catch (err) {
        console.error("❌ Error fetching forest details:", err);
        setError("Failed to load forest details.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchForestDetails();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900 text-emerald-400">
        ⏳ Loading forest details...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900 text-red-500">
        {error}
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
      <div className="relative z-10 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 mb-6 relative z-10"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Marketplace</span>
      </button>
        <div className="flex items-center mb-8">
          <TreePine className="h-12 w-12 text-emerald-400 mr-3" />
          <h1 className="text-3xl font-bold">
            Forest Area #{forest.listingId}
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "Seller", value: forest.seller },
            { label: "Current Owner", value: forest.currentOwner },
            { label: "Location", value: forest.location },
            { label: "GPS Coordinates", value: forest.gpsCoordinates },
            { label: "Area Size", value: `${forest.areaSize} ha` },
            { label: "Price", value: `${forest.price} HBAR` },
            {
              label: "Active Status",
              value: forest.isActive ? "Active" : "Inactive",
              valueClass: forest.isActive ? "text-green-400" : "text-red-400",
            },
            {
              label: "Deed (IPFS)",
              value: forest.ipfsDeedHash ? (
                <a
                  href={`https://ipfs.io/ipfs/${forest.ipfsDeedHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-emerald-400 hover:text-emerald-300"
                >
                  View Deed on IPFS
                </a>
              ) : (
                <span className="italic text-slate-400">No deed uploaded</span>
              ),
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50"
            >
              <p className="text-slate-400 text-sm mb-1">{item.label}</p>
              <p className={item.valueClass || "text-white"}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
