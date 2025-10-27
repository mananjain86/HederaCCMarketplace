// src/pages/ManageRelayers.jsx

import React, { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "../hooks/useToast";
import FOREST_ABI from "../abi/ForestTokenMarketplace.json";
import { ShieldAlert, ShieldCheck, ShieldOff, UserCheck } from "lucide-react";

// Make sure to use the same .env variable as your Navbar
const FOREST_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "0xD8a0C3B0CB1FDc61262772eE502a97C74dbA86B9";


export function ManageRelayers() {
  const { toast } = useToast();
  const [address, setAddress] = useState("");
  const [checkAddress, setCheckAddress] = useState("");
  const [isRelayer, setIsRelayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Helper function to get the contract and signer
  const getContract = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return null;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, signer);
  };

  // Function to call setRelayer(address, bool)
  const updateRelayerStatus = async (status) => {
    if (!ethers.isAddress(address)) {
      return toast.error("Please enter a valid Ethereum address.");
    }
    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) return;

      const tx = await contract.setRelayer(address, status);
      await tx.wait();

      const action = status ? "added" : "removed";
      toast.success(`Relayer ${action} successfully!`);
      setAddress("");
    } catch (err) {
      console.error("Failed to update relayer:", err);
      toast.error(err.reason || "Failed to update relayer status.");
    }
    setIsLoading(false);
  };

  // Function to check relayers(address)
  const checkRelayerStatus = async () => {
    if (!ethers.isAddress(checkAddress)) {
      return toast.error("Please enter a valid Ethereum address to check.");
    }
    setIsChecking(true);
    setIsRelayer(null); // Reset status
    try {
      // For read-only calls, we can just use a provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, provider);

      const status = await contract.relayers(checkAddress);
      setIsRelayer(status);
    } catch (err) {
      console.error("Failed to check relayer status:", err);
      toast.error(err.reason || "Failed to check relayer status.");
    }
    setIsChecking(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-emerald-400 mb-6">
          Manage Relayers
        </h1>
        <p className="text-slate-400 mb-8">
          Authorize or revoke addresses that can act as an oracle/relayer to
          update forest data. This action can only be performed by the{" "}
          <strong className="text-blue-400">Government Registrar</strong>{" "}
          account.
        </p>

        {/* Section 1: Add/Remove Relayer */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-300">
            Set Relayer Status
          </h2>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter relayer address (0x...)"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex space-x-4">
              <button
                onClick={() => updateRelayerStatus(true)}
                disabled={isLoading}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>{isLoading ? "Authorizing..." : "Authorize Relayer"}</span>
              </button>
              <button
                onClick={() => updateRelayerStatus(false)}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <ShieldOff className="h-5 w-5" />
                <span>{isLoading ? "Revoking..." : "Revoke Relayer"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Check Relayer Status */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-300">
            Check Relayer Status
          </h2>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              value={checkAddress}
              onChange={(e) => setCheckAddress(e.target.value)}
              placeholder="Enter address to check (0x...)"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={checkRelayerStatus}
              disabled={isChecking}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <UserCheck className="h-5 w-5" />
              <span>{isChecking ? "Checking..." : "Check Status"}</span>
            </button>

            {/* Status Display */}
            {isRelayer !== null && (
              <div
                className={`p-4 rounded-lg flex items-center space-x-3 ${
                  isRelayer
                    ? "bg-emerald-900 border border-emerald-700"
                    : "bg-red-900 border border-red-700"
                }`}
              >
                {isRelayer ? (
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-red-400" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {checkAddress.slice(0, 10)}...{checkAddress.slice(-8)}
                  </p>
                  <p
                    className={
                      isRelayer ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {isRelayer
                      ? "IS an authorized relayer."
                      : "is NOT an authorized relayer."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}