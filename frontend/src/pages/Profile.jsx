// src/pages/CompanyProfile.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle,
  Target,
  ShieldCheck,
  BarChart,
  Leaf,
  Sparkles,
  Award, // For claim button
  Database, // For yield display
  TreePine, // For Forest section header
} from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner"; // Make sure you have this component
import abi from "../abi/HandleCompany.json";
// --- NEW: Import Forest Contract ABI ---
import forestAbi from "../abi/ForestTokenMarketplace.json";
import { useToast } from "../hooks/useToast"; // Import useToast

// --- Constants ---
const COMPANY_ADDRESS =
  import.meta.env.VITE_COMPANY_CONTRACT_ADDRESS ||
  "0x6136a57179ddb0FeF580724263BDc73c96B31863"; // Ensure this is correct
const COMPANY_ABI = abi;
// --- NEW: Forest Contract Address ---
const FOREST_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "YOUR_NEW_FOREST_CONTRACT_ADDRESS_HERE"; // Replace with your deployed address
const FOREST_ABI = forestAbi;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://carbonchain-backend.onrender.com";

// --- Other constants (HashConnect, Token IDs - keep as needed) ---
const CARBON_TOKEN_ID = import.meta.env.VITE_CARBON_TOKEN_ID || "0.0.7074735";
const FOREST_TOKEN_ID = import.meta.env.VITE_FOREST_TOKEN_ID || "0.0.7074734";
const PROJECT_ID =
  import.meta.env.VITE_HASHCONNECT_PROJECT_ID ||
  "49c3c0e847f638a813f33db581602915";

const appMetadata = {
  name: "CarbonCredit Marketplace",
  description: "A marketplace for carbon credits",
  icons: ["https://www.hashpack.app/img/logo.svg"],
  url: window.location.origin,
};

// Main Component
export default function CompanyProfile() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true); // Initial load state
  const [pairingData, setPairingData] = useState(null);
  const [isAssociating, setIsAssociating] = useState(false);
  const [isAssociated, setIsAssociated] = useState(false);
  const [isForestAssociated, setIsForestAssociated] = useState(false);
  const [isForestAssociating, setIsForestAssociating] = useState(false);
  const { toast } = useToast();

  // State for forest shares and claiming
  const [ownedForestShares, setOwnedForestShares] = useState([]);
  const [isClaiming, setIsClaiming] = useState({}); // Track claiming state per forest ID { [forestId]: boolean }

  // Refs for dynamic imports
  const hashconnectRef = useRef(null);
  const sdkRef = useRef(null);

  // --- Functions for HashConnect/Token Association (Keep or remove if not using HashConnect) ---
  const checkForestTokenAssociation = async (accountId) => {
    if (!accountId || !FOREST_TOKEN_ID) return; // Add checks
    try {
      const url = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/tokens?token.id=${FOREST_TOKEN_ID}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Mirror node query failed: ${response.status}`);
      const data = await response.json();
      setIsForestAssociated(data?.tokens?.length > 0);
    } catch (e) {
      console.error("Could not check Forest token association:", e);
      setIsForestAssociated(false); // Default to false on error
    }
  };

  const checkTokenAssociation = async (accountId) => {
     if (!accountId || !CARBON_TOKEN_ID) return; // Add checks
    try {
      const url = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/tokens?token.id=${CARBON_TOKEN_ID}`;
      const response = await fetch(url);
       if (!response.ok) throw new Error(`Mirror node query failed: ${response.status}`);
      const data = await response.json();
      setIsAssociated(data?.tokens?.length > 0);
    } catch (e) {
      console.error("Could not check token association:", e);
      setIsAssociated(false); // Default to false on error
    }
  };

  const openHashPairingModal = () => {
    const hc = hashconnectRef.current;
    if (!hc) {
      toast.error("HashConnect not initialized yet. Please try again in a moment.");
      return;
    }
    hc.openPairingModal();
  };

  const handleAssociateForestToken = async () => {
    if (!sdkRef.current || !hashconnectRef.current) return toast.error("SDK or HashConnect not ready.");
    if (!pairingData) return openHashPairingModal();

    const accountIdString = pairingData.accountIds?.[0];
    if (!accountIdString) return toast.error("No Hedera account found in pairing data.");

    setIsForestAssociating(true);
    try {
      const { AccountId, TokenAssociateTransaction } = sdkRef.current;
      const accountId = AccountId.fromString(accountIdString);
      const signer = hashconnectRef.current.getSigner(accountId);
      const tx = await new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([FOREST_TOKEN_ID])
        .freezeWithSigner(signer);
      const response = await tx.executeWithSigner(signer);
      await response.getReceiptWithSigner(signer);
      toast.success("Forest token successfully associated!");
      setIsForestAssociated(true);
    } catch (err) {
      console.error("Forest Token Association Error:", err);
      toast.error(`Failed to associate Forest token: ${err?.message || "Please try again."}`);
    } finally {
      setIsForestAssociating(false);
    }
  };

   const handleAssociateToken = async () => {
       if (!sdkRef.current || !hashconnectRef.current) return toast.error("SDK or HashConnect not ready.");
       if (!pairingData) return openHashPairingModal();

       const accountIdString = pairingData.accountIds?.[0];
       if (!accountIdString) return toast.error("No Hedera account found in pairing data.");

       setIsAssociating(true);
       try {
         const { AccountId, TokenAssociateTransaction } = sdkRef.current;
         const accountId = AccountId.fromString(accountIdString);
         const signer = hashconnectRef.current.getSigner(accountId);
         const tx = await new TokenAssociateTransaction()
           .setAccountId(accountId)
           .setTokenIds([CARBON_TOKEN_ID])
           .freezeWithSigner(signer);
         const response = await tx.executeWithSigner(signer);
         await response.getReceiptWithSigner(signer);
         toast.success("Token successfully associated! You can now receive NFT receipts.");
         setIsAssociated(true);
       } catch (err) {
         console.error("Token Association Error:", err);
         toast.error(`Failed to associate token: ${err?.message || "Please try again."}`);
       } finally {
         setIsAssociating(false);
       }
     };
  // --- END HashConnect Functions ---

  // Fetches core company data AND owned forest shares
  const fetchCompanyData = useCallback(async () => {
    if (!window.ethereum) {
       console.warn("MetaMask not found");
       toast.error("MetaMask not found. Please install it."); // Add toast
       setLoading(false); // Stop loading if no wallet
       return;
    }

    // Don't reset loading to true if only re-fetching after claim
    // setLoading(true); // Keep previous loading state for re-fetches

    // Clear previous shares before fetching new ones
    setOwnedForestShares([]);

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const userAddress = accounts[0];
      const provider = new ethers.BrowserProvider(window.ethereum);

      // --- 1. Fetch Core Company Data ---
      const companyContract = new ethers.Contract(COMPANY_ADDRESS, COMPANY_ABI, provider);
      const details = await companyContract.getCompanyDetails(userAddress);

      if (!details.isRegistered) {
        setCompany(null); // Clear company if not registered
        setLoading(false); // Stop loading here if not registered
        return; // Exit early
      }

      // Check token associations if Hedera ID exists
      if (details.hederaAccountId && details.hederaAccountId !== "0.0.0") { // Check for valid ID
        await checkTokenAssociation(details.hederaAccountId);
        await checkForestTokenAssociation(details.hederaAccountId);
      } else {
         console.warn("Hedera Account ID not set for this company.");
         // Reset association states if no Hedera ID
         setIsAssociated(false);
         setIsForestAssociated(false);
      }

      const regulatory = await companyContract.getCompanyRegulatoryInfo(userAddress);
      const emissions = await companyContract.getCompanyEmissionsSummary(userAddress);
      const toSafeNumber = (value) => Number(value || 0);
      const carbonCreditsOwned = toSafeNumber(details.carbonCreditsOwned);
      const carbonFootprint =
        toSafeNumber(emissions.scope1Emissions) +
        toSafeNumber(emissions.scope2Emissions) +
        toSafeNumber(emissions.scope3Emissions);
      const creditsRequired = Math.max(0, carbonFootprint - carbonCreditsOwned); // Simpler calculation
      const verificationStatus = Number(details.verificationStatus);

      setCompany({
        name: details.name,
        hederaAccountId: details.hederaAccountId,
        isRegistered: details.isRegistered,
        verified: verificationStatus === 1,
        verificationStatus: verificationStatus,
        registrationYear: details.registrationTimestamp > 0 ? new Date(toSafeNumber(details.registrationTimestamp) * 1000).getFullYear() : 'N/A',
        walletAddress: regulatory.walletAddress,
        carbonFootprint: carbonFootprint,
        carbonCreditsOwned: carbonCreditsOwned,
        creditsRequired: creditsRequired,
        isCarbonNeutral: creditsRequired <= 0,
      });

      // --- 2. Fetch Owned Forest Shares ---
      const forestContract = new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, provider);
      const nextId = await forestContract.nextForestId();
      const ownedSharesDetails = [];

      console.log(`Checking forest shares up to ID: ${Number(nextId) - 1}`);

      for (let i = 1; i < Number(nextId); i++) {
        try {
          const sharesOwnedBI = await forestContract.shareBalance(i, userAddress);

          if (sharesOwnedBI > 0n) { // Use BigInt comparison
            console.log(`Found ${sharesOwnedBI} shares for Forest #${i}`);
            const forest = await forestContract.forests(i);

            // Ensure forest data is valid before proceeding
            if (forest.forestId.toString() === "0" || !forest.active) {
                console.warn(`Forest #${i} owned but data invalid or inactive.`);
                continue; // Skip this forest
            }

            const totalSharesBI = BigInt(forest.totalShares);
            const accumulatedYieldBI = BigInt(forest.accumulatedYield);
            let claimableYieldBI = 0n;

            // Calculate claimable yield using BigInt
            if (totalSharesBI > 0n && accumulatedYieldBI > 0n) {
              claimableYieldBI = (accumulatedYieldBI * sharesOwnedBI) / totalSharesBI;
            }

            ownedSharesDetails.push({
              id: i,
              location: forest.info.location || `Forest ${i}`, // Add fallback
              sharesOwned: Number(sharesOwnedBI),
              claimableYield: claimableYieldBI.toString(),
            });
          }
        } catch (forestErr) {
          console.warn(`Could not check/fetch details for Forest #${i}:`, forestErr);
        }
      }
      setOwnedForestShares(ownedSharesDetails);
      console.log("Owned Forest Shares Details:", ownedSharesDetails);

    } catch (err) {
      console.error("Failed to fetch company data:", err);
      setCompany(null);
      setOwnedForestShares([]);
      toast.error("Failed to load company profile.");
    } finally {
      setLoading(false); // Ensure loading is set to false in all cases
    }
  }, [toast]); // Dependency array includes toast

  // Handle Claim Yield Button Click
  const handleClaimYield = async (forestId) => {
    setIsClaiming(prev => ({ ...prev, [forestId]: true }));
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not found.");
        throw new Error("MetaMask not found");
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const forestContract = new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, signer);

      toast.info(`Sending claim transaction for Forest #${forestId}...`);
      const tx = await forestContract.claimYield(forestId);

      toast.info(`Waiting for confirmation (${tx.hash.slice(0, 6)})...`);
      const receipt = await tx.wait();

      if (receipt.status !== 1) {
        throw new Error("Transaction failed on-chain.");
      }

      // --- Mint Carbon Credit NFT Receipt ---
      // Find the claimed forest share info
      const claimedShare = ownedForestShares.find(s => s.id === forestId);
      if (!claimedShare) throw new Error("Could not find claimed forest share info.");

      // Get user address and company Hedera ID
      const userAddress = await signer.getAddress();
      const companyContract = new ethers.Contract(COMPANY_ADDRESS, COMPANY_ABI, provider);
      const companyDetails = await companyContract.getCompanyDetails(userAddress);
      const buyerHederaId = companyDetails.hederaAccountId;

      // Prepare payload for backend NFT minting (carbon credit NFT)
      const payload = {
        buyerHederaId,
        amount: claimedShare.claimableYield, // or the actual claimed amount
        ethereumTxHash: receipt.hash,
        buyerEthAddress: userAddress,
        projectName: claimedShare.location || `Forest #${forestId}`,
      };

      // Call backend to mint carbon credit NFT
      const response = await fetch(`${BACKEND_URL}/api/tokenize-purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(res => res.json());

      if (response.success) {
        toast.success(`Yield claimed and Carbon Credit NFT minted! Token ID: ${response.tokenId}`);
      } else {
        throw new Error(response.error || "Backend tokenization failed.");
      }

      // --- Update only the claimed forest share's yield locally ---
      setOwnedForestShares(prevShares =>
        prevShares.map(s =>
          s.id === forestId
            ? { ...s, claimableYield: "0" } // Set claimableYield to zero after claim
            : s
        )
      );

      await fetchCompanyData();

    } catch (err) {
      console.error(`Failed to claim yield for Forest #${forestId}:`, err);
      const reason = err.reason || err.data?.message || err.message || "An unknown error occurred.";
      toast.error(`Claim failed: ${reason}`);
    } finally {
      setIsClaiming(prev => ({ ...prev, [forestId]: false }));
    }
  };

  // Effect for Initialization and Account Changes
  useEffect(() => {
    let topic = ""; // Variable to hold topic for potential disconnect

     const initHashConnect = async () => {
         // ... (keep existing HashConnect init logic) ...
          try {
             if (typeof globalThis.global === "undefined") globalThis.global = globalThis;
             if (typeof globalThis.Buffer === "undefined") {
               try {
                 const bufferMod = await import("buffer");
                 globalThis.Buffer = bufferMod.Buffer;
               } catch (e) { console.warn("Buffer polyfill not available:", e); }
             }
             const hcModule = await import("hashconnect");
             const sdkModule = await import("@hashgraph/sdk");
             sdkRef.current = sdkModule;
             const { HashConnect } = hcModule;
             const { LedgerId } = sdkModule;
             const instance = new HashConnect(LedgerId.TESTNET, PROJECT_ID, appMetadata, true);
             hashconnectRef.current = instance;
             instance.pairingEvent.on(setPairingData);
             instance.disconnectionEvent.on(() => setPairingData(null));
             const initData = await instance.init();
             if (initData?.topic) topic = initData.topic;
             if (initData?.savedPairings?.length > 0) setPairingData(initData.savedPairings[0]);
             console.log("HashConnect init successful");
           } catch (err) { console.error("HashConnect init error:", err); }
     };

    fetchCompanyData(); // Initial fetch
    initHashConnect(); // Initialize HashConnect

    // Listener for MetaMask account changes
    const handleAccountsChanged = (accounts) => {
        console.log("MetaMask account changed, re-fetching data...");
        if (accounts.length > 0) {
            fetchCompanyData(); // Re-fetch data when account changes
        } else {
            // Handle disconnection case if needed
            setCompany(null);
            setOwnedForestShares([]);
            setLoading(false);
        }
    };
    window.ethereum?.on("accountsChanged", handleAccountsChanged);

    // Cleanup function
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      // Optional: Disconnect HashConnect session on component unmount
      // if (topic && hashconnectRef.current) {
      //   hashconnectRef.current.disconnect(topic);
      // }
    };
  }, [fetchCompanyData]); // fetchCompanyData is the main dependency

  // --- JSX Rendering Logic ---

  if (loading && !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea]">
        <LoadingSpinner /> <span className="ml-3 text-[#4a6741]">Loading profile...</span>
      </div>
    );
  }

  if (!company && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea]">
        <div className="bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-[#3a5a40]/20 max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1b4332] mb-2">Company Profile Not Found</h2>
          <p className="text-[#3a5a40]/80">
            The connected wallet address ({window.ethereum?.selectedAddress?.slice(0, 6)}...)
            is not registered. Please register your company or connect the correct wallet.
          </p>
        </div>
      </div>
    );
  }

  // Render profile if company data exists
  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-[#b7e4c7]/40 to-[#d8f3dc]/60 text-[#1b4332]">
      {/* --- Subtle Green Glassmorphism Backgrounds (Home style) --- */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)" }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)" }} />
        <div className="absolute left-1/2 top-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20"
          style={{ background: "conic-gradient(from 90deg at 50% 50%, #d8f3dc 0deg, #74c69d 120deg, #b7e4c7 240deg, #d8f3dc 360deg)" }} />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-[#40916c] hover:text-[#1b4332] mb-6 font-bold"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* --- Company Header --- */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-[#b7e4c7]/40 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-x-3 mb-2">
                <h1 className="text-3xl font-extrabold text-[#1b4332] tracking-tight drop-shadow-sm">{company.name}</h1>
                {/* Verification Status Badge */}
                {company.verificationStatus === 1 ? (
                  <div className="flex items-center space-x-1 text-[#40916c] text-sm bg-[#b7e4c7]/60 px-2 py-1 rounded-full font-semibold"><CheckCircle className="h-4 w-4" /> <span>Verified</span></div>
                ) : company.verificationStatus === 2 ? (
                  <div className="flex items-center space-x-1 text-red-500 text-sm bg-red-100/70 px-2 py-1 rounded-full font-semibold"><AlertCircle className="h-4 w-4" /> <span>Rejected</span></div>
                ) : company.verificationStatus === 3 ? (
                  <div className="flex items-center space-x-1 text-orange-500 text-sm bg-orange-100/70 px-2 py-1 rounded-full font-semibold"><AlertCircle className="h-4 w-4" /> <span>Suspended</span></div>
                ) : (
                  <div className="flex items-center space-x-1 text-yellow-600 text-sm bg-yellow-100/70 px-2 py-1 rounded-full font-semibold"><AlertCircle className="h-4 w-4" /> <span>Pending Verification</span></div>
                )}
              </div>
              <div className="flex items-center text-[#3a5a40]/80 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Registered in {company.registrationYear}</span>
              </div>
            </div>
            <div className="text-left lg:text-right w-full lg:w-auto mt-4 lg:mt-0">
              <div className="text-sm font-mono text-[#3a5a40]/80">EVM Wallet Address</div>
              <div className="text-base font-mono text-[#1b4332] break-all">{company.walletAddress}</div>
              {company.hederaAccountId && company.hederaAccountId !== "0.0.0" && (
                <>
                  <div className="text-sm font-mono text-[#3a5a40]/80 mt-2">Hedera Account ID</div>
                  <div className="text-base font-mono text-[#1b4332] break-all">{company.hederaAccountId}</div>
                </>
              )}
            </div>
          </div>
        </div>

      {/* --- Token Association Sections (Optional: Show only if Hedera ID exists) --- */}
      {company.hederaAccountId && company.hederaAccountId !== "0.0.0" && (
        <>
          {!isForestAssociated ? (
            <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 mb-8">
               {/* ... Forest association button ... */}
               <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                 <div>
                   <h3 className="text-lg font-semibold text-white">Enable Forest NFT Receipts</h3>
                   <p className="text-slate-400 text-sm">Connect your Hedera wallet ({company.hederaAccountId}) and associate our Forest token ({FOREST_TOKEN_ID}) to receive NFT receipts for forest purchases.</p>
                 </div>
                 <button onClick={ pairingData ? handleAssociateForestToken : openHashPairingModal } disabled={isForestAssociating} className="w-full md:w-auto bg-emerald-600 text-white py-2 px-5 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed">
                   <Leaf className="h-5 w-5" />
                   <span>{pairingData ? (isForestAssociating ? "Associating..." : "Enable Forest NFTs") : "Connect Hedera Wallet"}</span>
                 </button>
               </div>
            </div>
          ) : (
            <div className="bg-emerald-900/30 backdrop-blur-md rounded-xl p-6 border border-emerald-600/50 mb-8">
               {/* ... Forest associated confirmation ... */}
                <div className="flex items-center gap-3">
                 <CheckCircle className="h-6 w-6 text-emerald-400" />
                 <div>
                   <h3 className="text-lg font-semibold text-white">Forest NFT Receipts Enabled</h3>
                   <p className="text-slate-400 text-sm">Your Hedera account ({company.hederaAccountId}) is associated with token {FOREST_TOKEN_ID}.</p>
                 </div>
               </div>
            </div>
          )}
          {!isAssociated ? (
            <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 mb-8">
                {/* ... Carbon association button ... */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                 <div>
                   <h3 className="text-lg font-semibold text-white">Enable Carbon Credit NFT Receipts</h3>
                   <p className="text-slate-400 text-sm">Connect your Hedera wallet ({company.hederaAccountId}) and associate our Carbon Credit token ({CARBON_TOKEN_ID}) to receive unique NFT receipts.</p>
                 </div>
                 <button onClick={ pairingData ? handleAssociateToken : openHashPairingModal } disabled={isAssociating} className="w-full md:w-auto bg-emerald-600 text-white py-2 px-5 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed">
                   <Sparkles className="h-5 w-5" />
                   <span>{pairingData ? (isAssociating ? "Associating..." : "Enable Carbon NFTs") : "Connect Hedera Wallet"}</span>
                 </button>
               </div>
            </div>
          ) : (
            <div className="bg-emerald-900/30 backdrop-blur-md rounded-xl p-6 border border-emerald-600/50 mb-8">
                {/* ... Carbon associated confirmation ... */}
                 <div className="flex items-center gap-3">
                 <CheckCircle className="h-6 w-6 text-emerald-400" />
                 <div>
                   <h3 className="text-lg font-semibold text-white">Carbon Credit Receipts Enabled</h3>
                   <p className="text-slate-400 text-sm">Your Hedera account ({company.hederaAccountId}) is associated with token {CARBON_TOKEN_ID}.</p>
                 </div>
               </div>
            </div>
          )}
        </>
      )}


      {/* --- Carbon Stats --- */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
         {/* ... (Existing Carbon Footprint, Credits Purchased, Status cards) ... */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
             <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-white">Carbon Footprint</h3><BarChart className="h-5 w-5 text-red-400" /></div>
             <div className="text-3xl font-bold text-white mb-2">{company.carbonFootprint.toLocaleString()}</div>
             <div className="text-slate-400 text-sm">tons CO₂/year</div>
           </div>
           <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
             <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-white">Credits Balance</h3><Leaf className="h-5 w-5 text-emerald-400" /></div>
             <div className="text-3xl font-bold text-white mb-2">{company.carbonCreditsOwned.toLocaleString()}</div>
             <div className="text-slate-400 text-sm">tons CO₂ offset</div>
           </div>
           <div className={`bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border ${ company.isCarbonNeutral ? "border-emerald-500/50" : "border-slate-700/50" }`}>
               {company.isCarbonNeutral ? (
                 <>
                   <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-white">Status</h3><ShieldCheck className="h-5 w-5 text-emerald-400" /></div>
                   <div className="text-3xl font-bold text-emerald-400 mb-2">Carbon Neutral</div>
                   <div className="text-slate-400 text-sm">Footprint offset achieved!</div>
                 </>
               ) : (
                 <>
                   <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-white">Credits to Offset</h3><Target className="h-5 w-5 text-yellow-400" /></div>
                   <div className="text-3xl font-bold text-white mb-2">{company.creditsRequired.toLocaleString()}</div>
                   <div className="text-slate-400 text-sm">tons CO₂ needed</div>
                 </>
               )}
           </div>
      </div>

      {/* --- NEW: Forest Share Holdings Section --- */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-8 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <TreePine className="h-6 w-6 text-emerald-400" />
          Forest Share Holdings
        </h2>
        {loading && ownedForestShares.length === 0 && ( // Show loading indicator if still loading shares
           <div className="text-center py-4 flex justify-center items-center gap-2 text-slate-400"><LoadingSpinner size="sm"/> Loading shares...</div>
        )}
        {!loading && ownedForestShares.length === 0 && (
          <p className="text-slate-400 text-center py-4">
            You currently do not own shares in any listed forest areas. Purchase shares from the marketplace.
          </p>
        )}
        {ownedForestShares.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left"> {/* Added min-width for smaller screens */}
              <thead>
                <tr className="border-b border-slate-600 text-slate-400 text-sm uppercase">
                  <th className="py-3 px-4 font-semibold">Forest ID</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold text-right">Shares Owned</th>
                  <th className="py-3 px-4 font-semibold text-right">Claimable Yield</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {ownedForestShares.map((share) => {
                  const claimableBI = BigInt(share.claimableYield);
                  // Format claimable yield (assuming units represent smallest indivisible unit, like grams or kg*1000)
                  // Let's display raw units for now, add formatting/conversion later if needed
                  const claimableFormatted = claimableBI.toLocaleString();
                  const canClaim = claimableBI > 0n;
                  const currentlyClaiming = isClaiming[share.id];

                  return (
                    <tr key={share.id} className="border-b border-slate-700 hover:bg-slate-700/30 text-sm">
                      <td className="py-4 px-4 text-white font-mono">#{share.id}</td>
                      <td className="py-4 px-4 text-slate-300">{share.location}</td>
                      <td className="py-4 px-4 text-white font-mono text-right">
                        {share.sharesOwned.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-emerald-400 font-mono text-right">
                        {/* Add units label based on your contract logic */}
                        {claimableFormatted} units
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleClaimYield(share.id)}
                          disabled={!canClaim || currentlyClaiming || loading} // Disable if overall loading
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs py-2 px-3 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-all hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed w-full min-w-[110px]" // Added min-width
                        >
                          {currentlyClaiming ? (
                            <LoadingSpinner size="xs" /> // Smaller spinner
                          ) : (
                            <Award className="h-4 w-4" />
                          )}
                          <span>{currentlyClaiming ? "Claiming..." : "Claim Yield"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* --- END NEW SECTION --- */}

        </main>
      </div>
    );
}