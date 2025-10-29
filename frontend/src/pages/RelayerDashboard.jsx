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
  Hash, // Added for Forest ID input
  Star, // Added for AI Score input
  TrendingDown, // Added for Baseline input
} from "lucide-react";
// UPDATED: Ensure this points to your NEW contract ABI
import FOREST_ABI from "../abi/ForestTokenMarketplace.json";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "../components/LoadingSpinner"; // Make sure you have this component

// UPDATED: Use the correct .env variable for the NEW contract address
const FOREST_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "YOUR_NEW_FOREST_CONTRACT_ADDRESS_HERE"; // Replace with your deployed address

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://carbonchain-backend.onrender.com";

export default function RelayerDashboard() {
  const [account, setAccount] = useState(null);
  const [isRelayer, setIsRelayer] = useState(false);
  const [loading, setLoading] = useState(false); // Loading forest list
  const [forests, setForests] = useState([]);
  const [selectedForest, setSelectedForest] = useState(null);
  const [iotData, setIotData] = useState(null);
  const [regenScore, setRegenScore] = useState(null); // AI score object (0-100 based)
  const [updating, setUpdating] = useState(false); // Updating on-chain
  const [fetchingData, setFetchingData] = useState(false); // Fetching IoT/AI data
  const { toast } = useToast();

  // --- NEW: State for Baseline and Potential Inputs ---
  const [baselineInput, setBaselineInput] = useState("");
  const [potentialInput, setPotentialInput] = useState("");
  // --- END NEW STATE ---

  // Fetch registered forests
  const fetchForests = async () => {
    // ... (keep existing fetchForests logic, but update ABI used) ...
     if (!window.ethereum) {
       toast.error("Please install MetaMask");
       return;
     }

     setLoading(true);
     try {
       const provider = new ethers.BrowserProvider(window.ethereum);
       // UPDATED: Use correct ABI
       const contract = new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, provider);

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
               // Store the on-chain score (0-1000)
               regenerationScore: Number(forest.regenerationScore),
               lastUpdated: new Date(
                 Number(forest.lastUpdated) * 1000
               ).toLocaleString(),
               coordinates: forest.info.gpsCoordinates,
               areaSize: Number(forest.info.areaSize),
               // Store baseline/potential from contract for display/prefill
               baseline: forest.baselineSequestrationPerYear.toString(),
               potential: forest.potentialSequestrationPerYear.toString(),
             });
           }
         } catch (err) {
           console.error(`Failed to fetch forest ${i}:`, err);
         }
       }
       setForests(forestList);
       if (forestList.length > 0) {
         toast.success(`Loaded ${forestList.length} active forests`);
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
      // ... (keep existing init logic, but update ABI used) ...
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
         // UPDATED: Use correct ABI
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
         toast.error("Failed to connect wallet or check relayer status");
       }
    };
    init();
  }, []); // Run only once on mount

  // Fetch forests when relayer status is confirmed
  useEffect(() => {
    if (isRelayer && account) {
      fetchForests();
    }
  }, [isRelayer, account]);

  // Fetch IoT data from backend
  // UPDATED: Takes forest object directly to avoid state timing issues
  const fetchIoTData = async (forest) => {
    if (!forest || !forest.coordinates) {
        toast.error("Invalid forest data for fetching IoT.");
        return null;
    }
    setFetchingData(true); // Indicate loading
    setIotData(null); // Clear previous data
    try {
      console.log(`Fetching IoT for Forest #${forest.id} at ${forest.coordinates}`);
      const response = await fetch(`${BACKEND_URL}/api/iot/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forestId: `FOREST-${forest.id}`,
          location: forest.coordinates, // Use coordinates directly
        }),
      });

      const result = await response.json();
      console.log("IoT Response:", result);
      if (result.success) {
        setIotData(result.data);
        toast.success("IoT data fetched successfully");
        return result.data;
      } else {
        throw new Error(result.message || "Failed to fetch IoT data");
      }
    } catch (err) {
      console.error("Failed to fetch IoT data:", err);
      toast.error(`Failed to fetch IoT data: ${err.message}`);
      setIotData(null); // Ensure data is cleared on error
      return null;
    } finally {
        // We don't set fetchingData false here, let calculateRegenScore handle it
    }
  };

  // Calculate regeneration score using backend AI
  // UPDATED: Takes forest and iot objects directly
  const calculateRegenScore = async (forest, iot) => {
     if (!forest || !iot) {
         toast.error("Missing data for calculating score.");
         return null;
     }
     setRegenScore(null); // Clear previous score
    try {
      console.log(`Calculating score for Forest #${forest.id}`);
      const response = await fetch(
        `${BACKEND_URL}/api/ai/regeneration-score`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            forestData: { // Match expected backend structure if needed
              id: `FOREST-${forest.id}`,
              name: forest.location,
              location: forest.location,
              coordinates: forest.coordinates,
              area: forest.areaSize,
              type: "Mixed Forest", // Or fetch from contract if available
            },
            iotData: iot, // Pass the fetched IoT data
          }),
        }
      );

      const result = await response.json();
      console.log("Regen Score Response:", result);
      if (result.success) {
        setRegenScore(result.score); // Set the score object (0-100 based)
        toast.success("Regeneration score calculated");
        return result.score;
      } else {
        throw new Error(result.message || "Failed to calculate score");
      }
    } catch (err) {
      console.error("Failed to calculate regen score:", err);
      toast.error(`Failed to calculate regeneration score: ${err.message}`);
       setRegenScore(null); // Ensure score is cleared on error
      return null;
    } finally {
        setFetchingData(false); // Loading finished after both fetch/calc
    }
  };

  // UPDATED: updateRegenerationOnChain function
 // UPDATED: updateRegenerationOnChain function with Toasts
  const updateRegenerationOnChain = async () => {
    if (!isRelayer) {
      toast.error("Not authorized as relayer");
      return;
    }
    if (!selectedForest || !regenScore || !regenScore.score || typeof regenScore.score.overall !== 'number') {
      toast.error("Please select a forest and ensure AI score (0-100) is calculated.");
      return;
    }
    // Validation for new inputs
    if (baselineInput === "" || BigInt(baselineInput) < 0) {
      return toast.error("Please enter a valid Baseline value (0 or greater).");
    }
    if (potentialInput === "" || BigInt(potentialInput) < 0) {
      return toast.error("Please enter a valid Potential value (0 or greater).");
    }

    setUpdating(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, signer);

      const scorePerMille = Math.round(regenScore.score.overall * 10);
      if (scorePerMille < 0 || scorePerMille > 1000) {
        throw new Error("Calculated score is out of the valid 0-1000 range.");
      }
      const baselineValue = BigInt(baselineInput);
      const potentialValue = BigInt(potentialInput);

      // --- ADDED: Toast Info ---
      toast.info("Submitting regeneration update transaction...");
      console.log(`Calling updateRegeneration with: ForestID=${selectedForest.id}, Score=${scorePerMille}, Baseline=${baselineValue}, Potential=${potentialValue}`);

      const tx = await contract.updateRegeneration(
        selectedForest.id,
        scorePerMille,
        baselineValue,
        potentialValue
      );

      // --- ADDED: Toast Info ---
      toast.info(`Transaction Sent (${tx.hash.slice(0, 6)}...). Waiting for confirmation...`);
      await tx.wait();

      // --- ADDED: Toast Success ---
      toast.success(`Regeneration data updated successfully for Forest #${selectedForest.id}!`);

      // Refresh forest list to show updated score/time
      await fetchForests();

    } catch (err) {
      console.error("Failed to update regeneration:", err);
      const errorMessage = err.reason || err.data?.message || err.message || "Failed to update regeneration on-chain";
      // --- ENSURED: Toast Error ---
      toast.error(`Update failed: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  // Removed updateNFTMetadata function as requested

  // Handle forest selection and fetch data
  // UPDATED: Pass forest object directly to fetch/calculate functions
  const handleSelectForest = async (forest) => {
    setSelectedForest(forest);
    setIotData(null);
    setRegenScore(null);
    // Prefill baseline/potential inputs from the selected forest's current values
    setBaselineInput(forest.baseline || "");
    setPotentialInput(forest.potential || "");


    toast.info(`Fetching data for Forest #${forest.id}...`);

    // Pass the selected forest object directly
    const iot = await fetchIoTData(forest);
    if (iot) {
      // Pass both forest and the newly fetched iot data
      await calculateRegenScore(forest, iot);
    } else {
        setFetchingData(false); // Ensure loading stops if IoT fetch fails
    }
  };

  // ... (keep the JSX for Access Denied) ...
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
          {/* ... (keep existing header JSX) ... */}
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
                // ... (keep loading JSX) ...
                 <div className="text-center py-8">
                   <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
                   <p className="text-slate-400 mt-2">Loading forests...</p>
                 </div>
              ) : forests.length === 0 ? (
                // ... (keep no forests JSX) ...
                 <div className="text-center py-8">
                   <TreePine className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                   <p className="text-slate-400">No active forests found</p>
                   <p className="text-slate-500 text-sm mt-1">
                     Forests will appear here once registered
                   </p>
                 </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2"> {/* Added padding-right */}
                  {forests.map((forest) => (
                    <button
                      key={forest.id}
                      onClick={() => handleSelectForest(forest)}
                      // Disable button while fetching data for *any* forest
                      disabled={fetchingData}
                      className={`w-full text-left p-4 rounded-lg border transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                        selectedForest?.id === forest.id
                          ? "bg-purple-600/20 border-purple-500"
                          : "bg-slate-700/50 border-slate-600 hover:border-purple-500/50"
                      }`}
                    >
                      <div className="font-medium text-white">
                        Forest #{forest.id}
                      </div>
                      <div className="text-sm text-slate-400 mt-1 truncate">
                        {forest.location}
                      </div>
                      {/* UPDATED: Display score out of 1000 */}
                      <div className="text-xs text-emerald-400 mt-2">
                        Score: {forest.regenerationScore}/1000
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
            {!selectedForest && !fetchingData && ( // Show placeholder only if nothing is selected AND not fetching
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
                <TreePine className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Forest Selected
                </h3>
                <p className="text-slate-400">
                  Select a forest from the list to view details and update
                  regeneration data.
                </p>
              </div>
            )}

            {fetchingData && ( // Show loading indicator when fetching IoT/AI
                 <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
                   <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
                   <p className="text-slate-300">Fetching latest data...</p>
                 </div>
            )}

            {selectedForest && !fetchingData && ( // Show details only when a forest is selected AND not fetching
              <>
                {/* Forest Details */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                   {/* ... (keep Forest Details JSX, maybe update area unit) ... */}
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {selectedForest.location}
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-400">Forest ID:</span><span className="text-white ml-2">#{selectedForest.id}</span></div>
                      <div><span className="text-slate-400">HTS Token:</span><span className="text-white ml-2">{selectedForest.htsTokenId}</span></div>
                      <div><span className="text-slate-400">Serial:</span><span className="text-white ml-2">{selectedForest.serial}</span></div>
                      <div><span className="text-slate-400">Area:</span><span className="text-white ml-2">{selectedForest.areaSize.toLocaleString()} sq. m</span></div> {/* Updated Unit */}
                      <div className="col-span-2"><span className="text-slate-400">Coordinates:</span><span className="text-white ml-2">{selectedForest.coordinates}</span></div>
                       <div><span className="text-slate-400">Current Score:</span><span className="text-emerald-400 ml-2">{selectedForest.regenerationScore}/1000</span></div>
                       <div><span className="text-slate-400">Last Update:</span><span className="text-slate-300 ml-2">{selectedForest.lastUpdated}</span></div>
                    </div>
                </div>

                {/* IoT Data */}
                {iotData ? (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    {/* ... (keep existing IoT Data JSX) ... */}
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Cloud className="h-6 w-6 text-blue-400" />Real-time IoT Sensor Data</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-slate-700/50 p-4 rounded-lg"><div className="flex items-center gap-2 mb-2"><Thermometer className="h-5 w-5 text-orange-400" /><span className="text-slate-400 text-sm"> Temperature</span></div><div className="text-2xl font-bold text-white">{iotData.sensors.temperature}°C</div></div>
                        <div className="bg-slate-700/50 p-4 rounded-lg"><div className="flex items-center gap-2 mb-2"><Droplets className="h-5 w-5 text-blue-400" /><span className="text-slate-400 text-sm">Humidity</span></div><div className="text-2xl font-bold text-white">{iotData.sensors.humidity}%</div></div>
                        <div className="bg-slate-700/50 p-4 rounded-lg"><div className="flex items-center gap-2 mb-2"><Droplets className="h-5 w-5 text-green-400" /><span className="text-slate-400 text-sm"> Soil Moisture</span></div><div className="text-2xl font-bold text-white">{iotData.sensors.soilMoisture}%</div></div>
                        <div className="bg-slate-700/50 p-4 rounded-lg"><div className="flex items-center gap-2 mb-2"><Wind className="h-5 w-5 text-purple-400" /><span className="text-slate-400 text-sm"> Air Quality</span></div><div className="text-2xl font-bold text-white">{iotData.sensors.airQuality} AQI</div></div>
                        <div className="bg-slate-700/50 p-4 rounded-lg"><div className="flex items-center gap-2 mb-2"><Cloud className="h-5 w-5 text-gray-400" /><span className="text-slate-400 text-sm">CO₂ Level</span></div><div className="text-2xl font-bold text-white">{iotData.sensors.co2Level} ppm</div></div>
                        <div className="bg-slate-700/50 p-4 rounded-lg"><div className="flex items-center gap-2 mb-2"><TrendingUp className="h-5 w-5 text-yellow-400" /><span className="text-slate-400 text-sm"> Light Intensity</span></div><div className="text-2xl font-bold text-white">{iotData.sensors.lightIntensity} lux</div></div>
                     </div>
                  </div>
                ) : (
                  // Optional: Show a placeholder if IoT data hasn't loaded yet for the selected forest
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
                    <p className="text-slate-400">IoT data not available.</p>
                  </div>
                )}

                {/* Regeneration Score & Update Action */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                    Regeneration Update
                  </h3>

                  {regenScore ? (
                    <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-lg p-6 mb-6">
                      <div className="text-center">
                        <div className="text-slate-300 mb-1">Calculated AI Score</div>
                        {/* Display the 0-100 score */}
                        <div className="text-5xl font-bold text-emerald-400">
                          {regenScore.score.overall.toFixed(1)}/100
                        </div>
                         {/* Show the scaled score */}
                         <div className="text-sm text-purple-300 mt-1">
                            (Scaled for contract: {Math.round(regenScore.score.overall * 10)}/1000)
                          </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6 mb-6 text-center">
                       <p className="text-slate-400">AI Score not calculated yet.</p>
                    </div>
                  )}

                  {/* --- NEW: Baseline and Potential Inputs --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                      <TrendingDown className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={baselineInput}
                        onChange={(e) => setBaselineInput(e.target.value)}
                        placeholder="Baseline Sequestration / Year"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        disabled={updating}
                      />
                    </div>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={potentialInput}
                        onChange={(e) => setPotentialInput(e.target.value)}
                        placeholder="Potential Sequestration / Year"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        disabled={updating}
                      />
                    </div>
                  </div>
                  {/* --- END NEW INPUTS --- */}

                  <button
                    onClick={updateRegenerationOnChain}
                    // Disable if updating, or if no score is calculated
                    disabled={updating || !regenScore || typeof regenScore.score.overall !== 'number'}
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}