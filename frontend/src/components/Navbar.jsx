import React, { useState, useEffect, useRef } from "react";
import {
  Leaf,
  BarChart3,
  Building2,
  Wallet,
  ChevronDown,
  TreePine,
  Users,
  User,
  ShieldPlus
} from "lucide-react";
import { ethers } from "ethers";
import { useNavigate, Link } from "react-router-dom";
import COMPANY_ABI from "../abi/HandleCompany.json";
import FOREST_ABI from "../abi/ForestTokenMarketplace.json";


const COMPANY_ADDRESS = import.meta.env.VITE_COMPANY_CONTRACT_ADDRESS || "0x6136a57179ddb0FeF580724263BDc73c96B31863";
const FOREST_ADDRESS = import.meta.env.VITE_FOREST_CONTRACT_ADDRESS || "0x9A0b748B6A706eAb1C4Bf8541684C1eE41F0031D";

export function Navbar() {
  const [companyId, setCompanyId] = useState(null);
  const [account, setAccount] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // NEW
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false); // NEW
  const ownerDropdownRef = useRef(null); // NEW

  // separate dropdown states
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);

  const accountDropdownRef = useRef(null);
  const registerDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setAllAccounts(accounts);
        setAccount(accounts[0]);
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsRegistered(false);
    setAllAccounts([]);
    setIsOwner(false);
  };

  const checkOwnership = async (addr) => {
  if (!addr || !window.ethereum) return;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, provider);
    const ownerAddress = await contract.owner();
    setIsOwner(ownerAddress.toLowerCase() === addr.toLowerCase());
  } catch (err) {
    console.error("Failed to check ownership:", err);
    setIsOwner(false);
  }
};

  // Listen for account changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAllAccounts(accounts);
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setIsRegistered(false);
          setAllAccounts([]);
        }
      });
    }
  }, []);

  // Check if account is registered as a company
  const checkCompanyRegistration = async (addr) => {
    if (!addr || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        COMPANY_ADDRESS,
        COMPANY_ABI,
        provider
      );
      const allCompanies = await contract.getAllRegisteredCompanies();


      const normalizedCompanies = allCompanies.map((c, idx) => ({
        address: c.toString().toLowerCase(),
        id: idx + 1,
      }));

      const normalizedAddr = addr.toLowerCase();
      const matchedCompany = normalizedCompanies.find(
        (c) => c.address === normalizedAddr
      );

      if (matchedCompany) {
        setIsRegistered(true);
        setCompanyId(matchedCompany.id);
      } else {
        setIsRegistered(false);
        setCompanyId(null);
      }
    } catch (err) {
      console.error("Failed to fetch registered companies:", err);
    }
  };

  useEffect(() => {
    if (account){
    checkCompanyRegistration(account);
    checkOwnership(account);
  }
  }, [account]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setShowAccountDropdown(false);
      }
      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(event.target)) {
      setShowOwnerDropdown(false); // NEW
      }
    
      if (registerDropdownRef.current &&!registerDropdownRef.current.contains(event.target)
      ) {
        setShowRegisterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
  <nav className="bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/20 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Leaf className="h-8 w-8 text-emerald-400" />
          <span className="text-2xl font-bold text-white">CarbonChain</span>
          <span className="text-sm text-emerald-400 font-medium">
            Marketplace
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            <Building2 className="h-4 w-4" />
            <span>Marketplace</span>
          </Link>
          <Link
            to="/analytics"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </Link>
        </div>

        {/* Wallet + Register/Profile/Owner */}
        <div className="flex items-center space-x-4">
          {account ? (
            <>
              {/* Account Dropdown */}
              <div className="relative" ref={accountDropdownRef}>
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="px-3 py-1 rounded-lg bg-emerald-700 text-white text-sm font-mono"
                >
                  {account.slice(0, 6)}...{account.slice(-4)}
                </button>

                {showAccountDropdown && allAccounts.length > 1 && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                    {allAccounts.map((acc) => (
                      <button
                        key={acc}
                        onClick={() => {
                          setAccount(acc);
                          setShowAccountDropdown(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm font-mono ${
                          acc === account
                            ? "bg-emerald-600 text-white"
                            : "text-emerald-300 hover:bg-slate-700"
                        }`}
                      >
                        {acc.slice(0, 6)}...{acc.slice(-4)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile or Register */}
              {isRegistered ? (
                <button
                  onClick={() => navigate(`/profile/${companyId}`)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Go to Profile</span>
                </button>
              ) : (
                <div className="relative" ref={registerDropdownRef}>
                  <button
                    onClick={() =>
                      setShowRegisterDropdown(!showRegisterDropdown)
                    }
                    className="border border-emerald-400 text-emerald-400 px-4 py-2 rounded-lg font-medium hover:bg-emerald-400/10 transition-all flex items-center space-x-2"
                  >
                    <span>Register</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showRegisterDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                      <button
                        onClick={() => {
                          navigate("/register");
                          setShowRegisterDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3"
                      >
                        <Users className="h-5 w-5 text-emerald-400" />
                        <div>
                          <div className="font-medium">
                            Basic Company Registration
                          </div>
                          <div className="text-sm text-slate-400">
                            KYC/KYB and general company setup
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/register-seller");
                          setShowRegisterDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3 border-t border-slate-600"
                      >
                        <TreePine className="h-5 w-5 text-emerald-400" />
                        <div>
                          <div className="font-medium">
                            Carbon Credit Seller
                          </div>
                          <div className="text-sm text-slate-400">
                            Register as a project developer
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Owner Actions */}
              {isOwner && (
                <div className="relative" ref={ownerDropdownRef}>
                  <button
                    onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                    className="border border-yellow-400 text-yellow-400 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400/10 transition-all flex items-center space-x-2"
                  >
                    <span>Owner Actions</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showOwnerDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                      <button
                        onClick={() => {
                          navigate("/forest-seller-registration");
                          setShowOwnerDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3"
                      >
                        <TreePine className="h-5 w-5 text-yellow-400" />
                        <div>
                          <div className="font-medium">List New Forest Area</div>
                          <div className="text-sm text-slate-400">
                            Create a new listing for sale
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Disconnect */}
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