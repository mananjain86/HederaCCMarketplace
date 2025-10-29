import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  TreePine,
  RefreshCw,
  Radio,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Cloud,
  Droplets,
  Wind,
  Thermometer,
} from "lucide-react";
import FOREST_ABI from "../abi/ForestTokenMarketplace.json";
import { useToast } from "../hooks/useToast";

const FOREST_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "0xD8a0C3B0CB1FDc61262772eE502a97C74dbA86B9";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function RelayerDashboard() {
  const [account, setAccount] = useState(null);
  const [isRelayer, setIsRelayer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forests, setForests] = useState([]);
  const [selectedForest, setSelectedForest] = useState(null);
  const [iotData, setIotData] = useState(null);
  const [regenScore, setRegenScore] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  // Fetch registered forests
  const fetchForests = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, provider);

      // Get the next forest ID to determine how many forests exist
      const nextId = await contract.nextForestId();
      const forestList = [];

      for (let i = 1; i < Number(nextId); i++) {
        try {
          const forest = await contract.forests(i);
          if (forest.active) {
            forestList.push({
              id: i,
              location: forest.info.location,
              htsTokenId: forest.htsTokenId,
              serial: forest.serial.toString(),
              regenerationScore: Number(forest.regenerationScore),
              lastUpdated: new Date(
                Number(forest.lastUpdated) * 1000
              ).toLocaleString(),
              coordinates: forest.info.gpsCoordinates,
              areaSize: Number(forest.info.areaSize),
            });
          }
        } catch (err) {
          console.error(`Failed to fetch forest ${i}:`, err);
        }
      }
      setForests(forestList);
      if (forestList.length > 0) {
        toast.success(`Loaded ${forestList.length} forests`);
      } else {
        toast.info("No active forests found");
      }
    } catch (err) {
      console.error("Failed to fetch forests:", err);
      toast.error("Failed to load forests");
    } finally {
      setLoading(false);
    }
  };

  // Connect wallet and check relayer status
  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        toast.error("Please install MetaMask");
        return;
      }

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          FOREST_ADDRESS,
          FOREST_ABI,
          provider
        );
        const isRel = await contract.relayers(accounts[0]);
        setIsRelayer(isRel);

        if (!isRel) {
          toast.error("You are not authorized as a relayer");
        }
      } catch (err) {
        console.error("Initialization failed:", err);
        toast.error("Failed to connect wallet");
      }
    };
    init();
  }, []);

  // NEW: Fetch forests when component mounts and relayer status is confirmed
  useEffect(() => {
    if (isRelayer && account) {
      fetchForests();
    }
  }, [isRelayer, account]);

  // Fetch IoT data from backend
  const fetchIoTData = async (forestId) => {
    try {// forestid, location, topicId
      const coordinates = selectedForest.coordinates;
      console.log(coordinates);
      const response = await fetch(`${BACKEND_URL}/api/iot/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forestId: `FOREST-${forestId}`,
          location: coordinates,
        }),
      });

      const result = await response.json();
      console.log(result);
      if (result.success) {
        setIotData(result.data);
        toast.success("IoT data fetched successfully");
        return result.data;
      } else {
        throw new Error(result.message || "Failed to fetch IoT data");
      }
    } catch (err) {
      console.error("Failed to fetch IoT data:", err);
      toast.error("Failed to fetch IoT data");
      return null;
    }
  };

  // Calculate regeneration score using backend AI
  const calculateRegenScore = async (forestData, iotData) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/ai/regeneration-score`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            forestData: {
              id: `FOREST-${forestData.id}`,
              name: forestData.location,
              location: forestData.location,
              coordinates: forestData.coordinates,
              area: forestData.areaSize,
              type: "Mixed Forest",
            },
            iotData,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setRegenScore(result.score);
        toast.success("Regeneration score calculated");
        return result.score;
      } else {
        throw new Error(result.message || "Failed to calculate score");
      }
    } catch (err) {
      console.error("Failed to calculate regen score:", err);
      toast.error("Failed to calculate regeneration score");
      return null;
    }
  };

  // Update regeneration on smart contract
  const updateRegenerationOnChain = async () => {
    if (!isRelayer) {
      toast.error("Not authorized as relayer");
      return;
    }

    if (!selectedForest || !regenScore) {
      toast.error("Please select a forest and fetch data first");
      return;
    }

    setUpdating(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, signer);

      // Convert regeneration score (0-100) to per-mille (0-1000)
      const scorePerMille = Math.round(regenScore.score.overall * 10);

      // Calculate baseline and potential based on forest data
      // Example: 100 credits per hectare per year baseline
      const baseline = ethers.parseUnits(
        Math.round(selectedForest.areaSize * 100).toString(),
        0
      );
      // Example: 150 credits per hectare per year at full regeneration
      const potential = ethers.parseUnits(
        Math.round(selectedForest.areaSize * 150).toString(),
        0
      );

      toast.info("Submitting transaction to blockchain...");

      const tx = await contract.updateRegeneration(
        selectedForest.id,
        scorePerMille,
        baseline,
        potential
      );

      toast.info("Waiting for confirmation...");
      await tx.wait();

      toast.success("Regeneration score updated on-chain!");

      // Also update NFT metadata on Hedera
      await updateNFTMetadata();

      // Refresh forest list
      await fetchForests();
    } catch (err) {
      console.error("Failed to update regeneration:", err);
      const errorMessage = err.reason || err.message || "Failed to update regeneration on-chain";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Update NFT metadata on Hedera via backend
  const updateNFTMetadata = async () => {
    try {
      toast.info("Updating NFT metadata on Hedera...");
      
      const response = await fetch(`${BACKEND_URL}/api/nft/update-forest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: selectedForest.htsTokenId,
          serialNumber: selectedForest.serial,
          forestData: {
            id: `FOREST-${selectedForest.id}`,
            name: selectedForest.location,
            location: selectedForest.location,
            coordinates: selectedForest.coordinates,
            area: selectedForest.areaSize,
            type: "Mixed Forest",
          },
          topicId: "0.0.6886609",
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("NFT metadata updated on Hedera");
      } else {
        console.error("NFT update failed:", result.message);
        toast.warning("On-chain update succeeded but NFT metadata update failed");
      }
    } catch (err) {
      console.error("Failed to update NFT metadata:", err);
      toast.warning("On-chain update succeeded but NFT metadata update failed");
    }
  };

  // Handle forest selection and fetch data
  const handleSelectForest = async (forest) => {
    setSelectedForest(forest);
    setIotData(null);
    setRegenScore(null);

    toast.info("Fetching IoT data and calculating regeneration score...");

    const iot = await fetchIoTData(forest.id);
    if (iot) {
      await calculateRegenScore(forest, iot);
    }
  };

  if (!isRelayer && account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 pt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h2>
            <p className="text-slate-300">
              You are not authorized as a relayer. Please contact the government
              registrar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Radio className="h-10 w-10 text-purple-400" />
                Relayer Dashboard
              </h1>
              <p className="text-slate-300">
                Update forest regeneration scores and sync IoT data to blockchain
              </p>
            </div>
            <button
              onClick={fetchForests}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
              Refresh Forests
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forest List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TreePine className="h-6 w-6 text-emerald-400" />
                Registered Forests ({forests.length})
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
                  <p className="text-slate-400 mt-2">Loading forests...</p>
                </div>
              ) : forests.length === 0 ? (
                <div className="text-center py-8">
                  <TreePine className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">No forests found</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Forests will appear here once registered
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {forests.map((forest) => (
                    <button
                      key={forest.id}
                      onClick={() => handleSelectForest(forest)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedForest?.id === forest.id
                          ? "bg-purple-600/20 border-purple-500"
                          : "bg-slate-700/50 border-slate-600 hover:border-purple-500/50"
                      }`}
                    >
                      <div className="font-medium text-white">
                        Forest #{forest.id}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {forest.location}
                      </div>
                      <div className="text-xs text-emerald-400 mt-2">
                        Score: {forest.regenerationScore}/100
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Updated: {forest.lastUpdated}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {selectedForest ? (
              <>
                {/* Forest Details */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {selectedForest.location}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Forest ID:</span>
                      <span className="text-white ml-2">#{selectedForest.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">HTS Token:</span>
                      <span className="text-white ml-2">
                        {selectedForest.htsTokenId}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Serial:</span>
                      <span className="text-white ml-2">
                        {selectedForest.serial}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Area:</span>
                      <span className="text-white ml-2">
                        {selectedForest.areaSize} hectares
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400">Coordinates:</span>
                      <span className="text-white ml-2">
                        {selectedForest.coordinates}
                      </span>
                    </div>
                  </div>
                </div>

                {/* IoT Data */}
                {iotData && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Cloud className="h-6 w-6 text-blue-400" />
                      Real-time IoT Sensor Data
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="h-5 w-5 text-orange-400" />
                          <span className="text-slate-400 text-sm">
                            Temperature
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {iotData.sensors.temperature}°C
                        </div>
                      </div>
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="h-5 w-5 text-blue-400" />
                          <span className="text-slate-400 text-sm">Humidity</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {iotData.sensors.humidity}%
                        </div>
                      </div>
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="h-5 w-5 text-green-400" />
                          <span className="text-slate-400 text-sm">
                            Soil Moisture
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {iotData.sensors.soilMoisture}%
                        </div>
                      </div>
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="h-5 w-5 text-purple-400" />
                          <span className="text-slate-400 text-sm">
                            Air Quality
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {iotData.sensors.airQuality} AQI
                        </div>
                      </div>
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Cloud className="h-5 w-5 text-gray-400" />
                          <span className="text-slate-400 text-sm">CO₂ Level</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {iotData.sensors.co2Level} ppm
                        </div>
                      </div>
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-yellow-400" />
                          <span className="text-slate-400 text-sm">
                            Light Intensity
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {iotData.sensors.lightIntensity} lux
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regeneration Score */}
                {regenScore && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 text-emerald-400" />
                      AI-Powered Regeneration Score
                    </h3>
                    <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-lg p-6 mb-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-emerald-400 mb-2">
                          {regenScore.score.overall}/100
                        </div>
                        <div className="text-slate-300">Overall Score</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-slate-700/50 p-3 rounded-lg">
                        <div className="text-slate-400 text-sm mb-1">
                          Vegetation
                        </div>
                        <div className="text-xl font-bold text-white">
                          {regenScore.factors.vegetationDensity}/100
                        </div>
                      </div>
                      <div className="bg-slate-700/50 p-3 rounded-lg">
                        <div className="text-slate-400 text-sm mb-1">
                          Soil Health
                        </div>
                        <div className="text-xl font-bold text-white">
                          {regenScore.factors.soilHealth}/100
                        </div>
                      </div>
                      <div className="bg-slate-700/50 p-3 rounded-lg">
                        <div className="text-slate-400 text-sm mb-1">
                          Air Quality
                        </div>
                        <div className="text-xl font-bold text-white">
                          {regenScore.factors.airQuality}/100
                        </div>
                      </div>
                      <div className="bg-slate-700/50 p-3 rounded-lg">
                        <div className="text-slate-400 text-sm mb-1">
                          Water Availability
                        </div>
                        <div className="text-xl font-bold text-white">
                          {regenScore.factors.waterAvailability}/100
                        </div>
                      </div>
                      <div className="bg-slate-700/50 p-3 rounded-lg">
                        <div className="text-slate-400 text-sm mb-1">Climate</div>
                        <div className="text-xl font-bold text-white">
                          {regenScore.factors.climateConditions}/100
                        </div>
                      </div>
                    </div>
                    {regenScore.score.analysis && (
                      <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                        <div className="text-sm text-slate-400 mb-1">
                          AI Analysis:
                        </div>
                        <div className="text-white text-sm">
                          {regenScore.score.analysis}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Update Button */}
                <button
                  onClick={updateRegenerationOnChain}
                  disabled={updating || !regenScore}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating On-Chain...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Update Regeneration Score On-Chain
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
                <TreePine className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Forest Selected
                </h3>
                <p className="text-slate-400">
                  Select a forest from the list to view details and update
                  regeneration data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}