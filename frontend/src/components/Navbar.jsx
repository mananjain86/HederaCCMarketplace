import React, { useState, useEffect, useRef } from "react";
import { Leaf, BarChart3, Building2, Wallet, ChevronDown, TreePine, Users, Sparkles, User } from "lucide-react";
import { ethers } from "ethers";
import abi from "../abi/HandleCompany.json";

const COMPANY_ABI = abi;
const COMPANY_ADDRESS = "0xf1A975549085613B4399931d95b4ab10791887C9";

export function Navbar({ currentView, onViewChange }) {
  const [account, setAccount] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsRegistered(false);
  };

  // Check if account is registered as a company
  const checkCompanyRegistration = async (addr) => {
    if (!addr || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(COMPANY_ADDRESS, COMPANY_ABI, provider);
      const allCompanies = await contract.getAllRegisteredCompanies();
      setIsRegistered(allCompanies.includes(addr));
    } catch (err) {
      console.error("Failed to fetch registered companies:", err);
    }
  };

  // Effect: check registration on account change
  useEffect(() => {
    if (account) checkCompanyRegistration(account);
  }, [account]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRegisterDropdown(false);
      }
    }
    if (showRegisterDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showRegisterDropdown]);

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-emerald-400" />
            <span className="text-2xl font-bold text-white">CarbonChain</span>
            <span className="text-sm text-emerald-400 font-medium">Marketplace</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onViewChange("marketplace")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentView === "marketplace" ? "bg-emerald-500 text-white" : "text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Marketplace</span>
            </button>
            <button
              onClick={() => onViewChange("analytics")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentView === "analytics" ? "bg-emerald-500 text-white" : "text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </div>

          {/* Wallet + Register/Profile */}
          <div className="flex items-center space-x-4">
            {account ? (
              <>
                <span className="px-3 py-1 rounded-lg bg-emerald-700 text-white text-sm font-mono">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                {isRegistered ? (
                  <button
                    onClick={() => onViewChange("profile")}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Go to Profile</span>
                  </button>
                ) : (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowRegisterDropdown(!showRegisterDropdown)}
                      className="border border-emerald-400 text-emerald-400 px-4 py-2 rounded-lg font-medium hover:bg-emerald-400/10 transition-all flex items-center space-x-2"
                    >
                      <span>Register</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showRegisterDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                        <button
                          onClick={() => {
                            onViewChange("register");
                            setShowRegisterDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3"
                        >
                          <Users className="h-5 w-5 text-emerald-400" />
                          <div>
                            <div className="font-medium">Basic Company Registration</div>
                            <div className="text-sm text-slate-400">KYC/KYB and general company setup</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            onViewChange("register-seller");
                            setShowRegisterDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3 border-t border-slate-600"
                        >
                          <TreePine className="h-5 w-5 text-emerald-400" />
                          <div>
                            <div className="font-medium">Carbon Credit Seller</div>
                            <div className="text-sm text-slate-400">Register as a project developer</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}