// src/pages/CompanyProfile.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
// import { HashConnect } from "hashconnect";
// import { LedgerId, TokenAssociateTransaction, AccountId } from "@hashgraph/sdk";
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
} from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import abi from "../abi/HandleCompany.json";

// --- Constants ---
const COMPANY_ADDRESS =
  import.meta.env.VITE_COMPANY_CONTRACT_ADDRESS ||
  "0x6136a57179ddb0FeF580724263BDc73c96B31863";
const COMPANY_ABI = abi;
const CARBON_TOKEN_ID = "0.0.6886497";
const FOREST_TOKEN_ID = "0.0.6886481";
const PROJECT_ID =
  import.meta.env.VITE_HASHCONNECT_PROJECT_ID ||
  "49c3c0e847f638a813f33db581602915";

const appMetadata = {
  name: "CarbonCredit Marketplace",
  description: "A marketplace for carbon credits",
  icons: ["https://www.hashpack.app/img/logo.svg"],
  url: window.location.origin,
};

// REMOVED static new HashConnect(...) here and instead will initialize dynamically
export default function CompanyProfile() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pairingData, setPairingData] = useState(null);
  const [isAssociating, setIsAssociating] = useState(false);
  const [isAssociated, setIsAssociated] = useState(false);
  const [isForestAssociated, setIsForestAssociated] = useState(false);
  const [isForestAssociating, setIsForestAssociating] = useState(false);

  // refs to hold dynamic imports / instances
  const hashconnectRef = useRef(null);
  const sdkRef = useRef(null);

  const checkForestTokenAssociation = async (accountId) => {
    try {
      const url = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/tokens?token.id=${FOREST_TOKEN_ID}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.tokens && data.tokens.length > 0) {
        setIsForestAssociated(true);
      } else {
        setIsForestAssociated(false);
      }
    } catch (e) {
      console.error("Could not check Forest token association:", e);
      setIsForestAssociated(false);
    }
  };

  const checkTokenAssociation = async (accountId) => {
    try {
      const url = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/tokens?token.id=${CARBON_TOKEN_ID}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.tokens && data.tokens.length > 0) {
        setIsAssociated(true);
      } else {
        setIsAssociated(false);
      }
    } catch (e) {
      console.error("Could not check token association:", e);
      setIsAssociated(false);
    }
  };

  const fetchCompanyData = useCallback(async () => {
    if (!window.ethereum) return console.warn("MetaMask not found");
    setLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAddress = accounts[0];
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        COMPANY_ADDRESS,
        COMPANY_ABI,
        provider
      );
      const details = await contract.getCompanyDetails(userAddress);

      if (!details.isRegistered) {
        setCompany(null);
        setLoading(false);
        return;
      } 
      console.log("Verification Status (raw):", details.verificationStatus);
      console.log("Verification Status (Number):", Number(details.verificationStatus));
      
      if (details.hederaAccountId) {
        await checkTokenAssociation(details.hederaAccountId);
        await checkForestTokenAssociation(details.hederaAccountId);
      }
      console.log("Hedera Account ID:", details.hederaAccountId);

      const regulatory = await contract.getCompanyRegulatoryInfo(userAddress);
      const emissions = await contract.getCompanyEmissionsSummary(userAddress);
      const toSafeNumber = (value) => Number(value || 0);
      const carbonCreditsOwned = toSafeNumber(details.carbonCreditsOwned);
      const carbonFootprint =
        toSafeNumber(emissions.scope1Emissions) +
        toSafeNumber(emissions.scope2Emissions) +
        toSafeNumber(emissions.scope3Emissions);
      const creditsRequired = carbonFootprint - carbonCreditsOwned;

      // Convert BigInt verification status to number for comparison
      const verificationStatus = Number(details.verificationStatus);
      
      setCompany({
        name: details.name,
        hederaAccountId: details.hederaAccountId,
        isRegistered: details.isRegistered,
        verified: verificationStatus === 1, // 0 = Pending, 1 = Verified, 2 = Rejected, 3 = Suspended
        verificationStatus: verificationStatus, // Store the actual status for more detailed checks if needed
        registrationYear: new Date(
          toSafeNumber(details.registrationTimestamp) * 1000
        ).getFullYear(),
        walletAddress: regulatory.walletAddress,
        carbonFootprint: carbonFootprint,
        carbonCreditsOwned: carbonCreditsOwned,
        creditsRequired: creditsRequired > 0 ? creditsRequired : 0,
        isCarbonNeutral: creditsRequired <= 0,
      });
    } catch (err) {
      console.error("Failed to fetch company data:", err);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let topic = "";

    const initHashConnect = async () => {
      try {
        // Browser shim: ensure "global" and Buffer exist before loading Node-targeted libs
        if (typeof globalThis.global === "undefined") {
          globalThis.global = globalThis;
        }
        if (typeof globalThis.Buffer === "undefined") {
          // dynamic import of 'buffer' (install it if you haven't: npm i buffer)
          try {
            const bufferMod = await import("buffer");
            globalThis.Buffer = bufferMod.Buffer;
          } catch (e) {
            console.warn("Buffer polyfill not available:", e);
          }
        }

        // Dynamically import hashconnect and @hashgraph/sdk after shims
        const hcModule = await import("hashconnect");
        const sdkModule = await import("@hashgraph/sdk");

        sdkRef.current = sdkModule;
        const { HashConnect } = hcModule;
        const { LedgerId } = sdkModule;

        // create instance and store on ref
        const instance = new HashConnect(LedgerId.TESTNET, PROJECT_ID, appMetadata, true);
        hashconnectRef.current = instance;

        // wire events to local state
        instance.pairingEvent.on((newPairing) => setPairingData(newPairing));
        instance.disconnectionEvent.on(() => setPairingData(null));

        const initData = await instance.init();
        if (initData && initData.topic) {
          topic = initData.topic;
        }
        if (initData && initData.savedPairings && initData.savedPairings.length > 0) {
          setPairingData(initData.savedPairings[0]);
        }
        console.log("HashConnect init successful");
      } catch (err) {
        console.error("HashConnect init error:", err);
      }
    };

    fetchCompanyData();
    initHashConnect();

    const handleAccountsChanged = () => fetchCompanyData();
    window.ethereum?.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      if (topic && hashconnectRef.current) {
        hashconnectRef.current.disconnect(topic);
      }
    };
  }, [fetchCompanyData]);

  const openHashPairingModal = () => {
    const hc = hashconnectRef.current;
    if (!hc) {
      alert("HashConnect not initialized yet. Please try again in a moment.");
      return;
    }
    hc.openPairingModal();
  };

  const handleAssociateForestToken = async () => {
    if (!pairingData) {
      openHashPairingModal();
      return;
    }
    const accountIdString = pairingData.accountIds?.[0];
    if (!accountIdString) {
      alert("No Hedera account found in pairing data.");
      return;
    }

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

      alert("Forest token successfully associated!");
      setIsForestAssociated(true);
    } catch (err) {
      console.error("Forest Token Association Error:", err);
      alert(
        `Failed to associate Forest token: ${err?.message || "Please try again."}`
      );
    } finally {
      setIsForestAssociating(false);
    }
  };

  const handleAssociateToken = async () => {
    if (!pairingData) {
      openHashPairingModal();
      return;
    }
    const accountIdString = pairingData.accountIds?.[0];
    if (!accountIdString) {
      alert("No Hedera account found in pairing data.");
      return;
    }

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

      alert("Token successfully associated! You can now receive NFT receipts.");
      setIsAssociated(true);
    } catch (err) {
      console.error("Token Association Error:", err);
      alert(
        `Failed to associate token: ${err?.message || "Please try again."}`
      );
    } finally {
      setIsAssociating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div className="bg-slate-800/70 p-8 rounded-xl border border-slate-700/50">
          <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Company Profile Not Found
          </h2>
          <p className="text-slate-400">
            The connected wallet address is not registered in our system. Please
            register your company to view your profile.
          </p>
        </div>
      </div>
    );
  }
  console.log("Company Data:", company);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => window.history.back()}
        className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="bg-gradient-to-r from-slate-800/70 to-slate-700/70 backdrop-blur-md rounded-xl p-8 mb-8 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{company.name}</h1>
              {company.verificationStatus === 1 ? (
                <div className="flex items-center space-x-1 text-emerald-400 text-sm bg-emerald-900/50 px-2 py-1 rounded-full">
                  <CheckCircle className="h-4 w-4" /> <span>Verified</span>
                </div>
              ) : company.verificationStatus === 2 ? (
                <div className="flex items-center space-x-1 text-red-400 text-sm bg-red-900/50 px-2 py-1 rounded-full">
                  <AlertCircle className="h-4 w-4" /> <span>Rejected</span>
                </div>
              ) : company.verificationStatus === 3 ? (
                <div className="flex items-center space-x-1 text-orange-400 text-sm bg-orange-900/50 px-2 py-1 rounded-full">
                  <AlertCircle className="h-4 w-4" /> <span>Suspended</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-yellow-400 text-sm bg-yellow-900/50 px-2 py-1 rounded-full">
                  <AlertCircle className="h-4 w-4" />{" "}
                  <span>Pending Verification</span>
                </div>
              )}
            </div>
            <div className="flex items-center text-slate-400">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Registered in {company.registrationYear}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-slate-400">
              Wallet Address
            </div>
            <div className="text-lg font-mono text-white break-all">
              {company.walletAddress}
            </div>
          </div>
        </div>
      </div>
      {!isForestAssociated ? (
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Enable Forest NFT Receipts
              </h3>
              <p className="text-slate-400 text-sm">
                Connect your Hedera wallet and associate our Forest token to
                receive NFT receipts for forest purchases.
              </p>
            </div>
            <button
              onClick={
                pairingData ? handleAssociateForestToken : openHashPairingModal
              }
              disabled={isForestAssociating}
              className="w-full md:w-auto bg-emerald-600 text-white py-2 px-5 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Leaf className="h-5 w-5" />
              <span>
                {pairingData
                  ? isForestAssociating
                    ? "Associating..."
                    : "Enable Forest NFT Receipts"
                  : "Connect Hedera Wallet"}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-900/30 backdrop-blur-md rounded-xl p-6 border border-emerald-600/50 mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-emerald-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Forest NFT Receipts Enabled
              </h3>
              <p className="text-slate-400 text-sm">
                Your Hedera account is successfully associated. You will now
                receive Forest NFT receipts.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isAssociated ? (
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Enable Hedera NFT Receipts
              </h3>
              <p className="text-slate-400 text-sm">
                Connect your Hedera wallet and associate our token to receive
                unique NFT receipts for every purchase.
              </p>
            </div>
            <button
              onClick={
                pairingData ? handleAssociateToken : openHashPairingModal
              }
              disabled={isAssociating}
              className="w-full md:w-auto bg-emerald-600 text-white py-2 px-5 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-5 w-5" />
              <span>
                {pairingData
                  ? isAssociating
                    ? "Associating..."
                    : "Enable NFT Receipts"
                  : "Connect Hedera Wallet"}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-900/30 backdrop-blur-md rounded-xl p-6 border border-emerald-600/50 mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-emerald-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Carbon Credit Receipts Enabled
              </h3>
              <p className="text-slate-400 text-sm">
                Your Hedera account is successfully associated. You will now
                receive receipts for your purchases.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Carbon Footprint
            </h3>
            <BarChart className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {company.carbonFootprint.toLocaleString()}
          </div>
          <div className="text-slate-400 text-sm">tons CO₂/year</div>
        </div>
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Credits Purchased
            </h3>
            <Leaf className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {company.carbonCreditsOwned.toLocaleString()}
          </div>
          <div className="text-slate-400 text-sm">tons CO₂ offset</div>
        </div>
        <div
          className={`bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border ${
            company.isCarbonNeutral
              ? "border-emerald-500/50"
              : "border-slate-700/50"
          }`}
        >
          {company.isCarbonNeutral ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Status</h3>
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                Carbon Neutral
              </div>
              <div className="text-slate-400 text-sm">
                Footprint offset achieved!
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Credits to Offset
                </h3>
                <Target className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {company.creditsRequired.toLocaleString()}
              </div>
              <div className="text-slate-400 text-sm">tons CO₂ needed</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
