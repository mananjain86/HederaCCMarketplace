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
  ShieldPlus,
  Radio, // NEW: Icon for relayer
} from "lucide-react";
import { ethers } from "ethers";
import { useNavigate, Link } from "react-router-dom";
import COMPANY_ABI from "../abi/HandleCompany.json";
import FOREST_ABI from "../abi/ForestTokenMarketplace.json";
import { useToast } from "../hooks/useToast";

const COMPANY_ADDRESS =
  import.meta.env.VITE_COMPANY_CONTRACT_ADDRESS ||
  "0x6136a57179ddb0FeF580724263BDc73c96B31863";

const FOREST_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "0xD8a0C3B0CB1FDc61262772eE502a97C74dbA86B9";

export function Navbar() {
  const [companyId, setCompanyId] = useState(null);
  const [account, setAccount] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isGovernment, setIsGovernment] = useState(false);
  const [isRelayer, setIsRelayer] = useState(false); // NEW: State for relayer
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showGovDropdown, setShowGovDropdown] = useState(false);
  const [showRelayerDropdown, setShowRelayerDropdown] = useState(false); // NEW: Relayer dropdown
  const ownerDropdownRef = useRef(null);
  const govDropdownRef = useRef(null);
  const relayerDropdownRef = useRef(null); // NEW: Ref for relayer dropdown
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);

  const accountDropdownRef = useRef(null);
  const registerDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return toast.error("Please install MetaMask!");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setAllAccounts(accounts);
        setAccount(accounts[0]);
        toast.success("Wallet connected successfully!");
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsRegistered(false);
    setAllAccounts([]);
    setIsOwner(false);
    setIsGovernment(false);
    setIsRelayer(false); // NEW: Reset relayer state
    toast.info("Wallet disconnected successfully!");
  };

  // Check platform admin (owner)
  const checkOwnership = async (addr) => {
    if (!addr || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        FOREST_ADDRESS,
        FOREST_ABI,
        provider
      );
      const ownerAddress = await contract.owner();
      setIsOwner(ownerAddress.toLowerCase() === addr.toLowerCase());
    } catch (err) {
      console.error("Failed to check ownership:", err);
      setIsOwner(false);
    }
  };

  // Check government registrar
  const checkGovernmentStatus = async (addr) => {
    if (!addr || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        FOREST_ADDRESS,
        FOREST_ABI,
        provider
      );
      const govAddress = await contract.governmentRegistrar();
      setIsGovernment(govAddress.toLowerCase() === addr.toLowerCase());
    } catch (err) {
      console.error("Failed to check government status:", err);
      setIsGovernment(false);
    }
  };

  // NEW: Check if account is a relayer
  const checkRelayerStatus = async (addr) => {
    if (!addr || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        FOREST_ADDRESS,
        FOREST_ABI,
        provider
      );
      const isRel = await contract.relayers(addr);
      setIsRelayer(isRel);
    } catch (err) {
      console.error("Failed to check relayer status:", err);
      setIsRelayer(false);
    }
  };

  // Listen for account changes
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
          setIsOwner(false);
          setIsGovernment(false);
          setIsRelayer(false); // NEW: Reset on account change
        }
      });
    }
  }, []);

  // Check company registration
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
    if (account) {
      checkCompanyRegistration(account);
      checkOwnership(account);
      checkGovernmentStatus(account);
      checkRelayerStatus(account); // NEW: Check relayer status
    }
  }, [account]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target)
      ) {
        setShowAccountDropdown(false);
      }
      if (
        ownerDropdownRef.current &&
        !ownerDropdownRef.current.contains(event.target)
      ) {
        setShowOwnerDropdown(false);
      }
      if (
        govDropdownRef.current &&
        !govDropdownRef.current.contains(event.target)
      ) {
        setShowGovDropdown(false);
      }
      // NEW: Add handler for relayer dropdown
      if (
        relayerDropdownRef.current &&
        !relayerDropdownRef.current.contains(event.target)
      ) {
        setShowRelayerDropdown(false);
      }
      if (
        registerDropdownRef.current &&
        !registerDropdownRef.current.contains(event.target)
      ) {
        setShowRegisterDropdown(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
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
          <Link
            to="/"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-emerald-400" />
              <span className="text-2xl font-bold text-white">CarbonChain</span>
              <span className="text-sm text-emerald-400 font-medium">
                Marketplace
              </span>
            </div>
          </Link>

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
            <Link
              to="/dao"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-emerald-300 hover:bg-emerald-500/20 transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              <span>DAO</span>
            </Link>

          </div>

          {/* Wallet + Role-based Dropdowns */}
          <div className="flex items-center space-x-4">
            {account ? (
              <>
                {/* Register Dropdown (if not registered) */}
                {isRegistered ? (
                  ""
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

                {/* NEW: Relayer Actions Dropdown */}
                {isRelayer && (
                  <div className="relative" ref={relayerDropdownRef}>
                    <button
                      onClick={() => setShowRelayerDropdown(!showRelayerDropdown)}
                      className="border border-purple-400 text-purple-400 px-4 py-2 rounded-lg font-medium hover:bg-purple-400/10 transition-all flex items-center space-x-2"
                    >
                      <Radio className="h-4 w-4" />
                      <span>Relayer Actions</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showRelayerDropdown && (
                      <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                        <button
                          onClick={() => {
                            navigate("/relayer-dashboard");
                            setShowRelayerDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3"
                        >
                          <TreePine className="h-5 w-5 text-purple-400" />
                          <div>
                            <div className="font-medium">
                              Update Forest Regeneration
                            </div>
                            <div className="text-sm text-slate-400">
                              Sync IoT data and regeneration scores
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Government Actions Dropdown */}
                {isGovernment && (
                  <div className="relative" ref={govDropdownRef}>
                    <button
                      onClick={() => setShowGovDropdown(!showGovDropdown)}
                      className="border border-blue-400 text-blue-400 px-4 py-2 rounded-lg font-medium hover:bg-blue-400/10 transition-all flex items-center space-x-2"
                    >
                      <span>Government Actions</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showGovDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                        <button
                          onClick={() => {
                            navigate("/forest-seller-registration");
                            setShowGovDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3"
                        >
                          <TreePine className="h-5 w-5 text-blue-400" />
                          <div>
                            <div className="font-medium">
                              List New Forest Area
                            </div>
                            <div className="text-sm text-slate-400">
                              Create a new listing for sale
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/manage-relayers");
                            setShowGovDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3"
                        >
                          <Users className="h-5 w-5 text-blue-400" />
                          <div>
                            <div className="font-medium">Manage Relayers</div>
                            <div className="text-sm text-slate-400">
                              Authorize or revoke oracles
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Platform Admin Actions */}
                {isOwner && (
                  <div className="relative" ref={ownerDropdownRef}>
                    <button
                      onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                      className="border border-yellow-400 text-yellow-400 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400/10 transition-all flex items-center space-x-2"
                    >
                      <span>Admin Actions</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showOwnerDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                        <button
                          onClick={() => {
                            navigate("/grant-kyc");
                            setShowOwnerDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3"
                        >
                          <ShieldPlus className="h-5 w-5 text-yellow-400" />
                          <div>
                            <div className="font-medium">Grant Token KYC</div>
                            <div className="text-sm text-slate-400">
                              Approve companies to trade tokens
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/verify-company");
                            setShowOwnerDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3"
                        >
                          <ShieldPlus className="h-5 w-5 text-yellow-400" />
                          <div>
                            <div className="font-medium">
                              Verify Registered Companies
                            </div>
                            <div className="text-sm text-slate-400">
                              Check if registered companies are legitimate
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/manage-credits");
                            setShowOwnerDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3"
                        >
                          <BarChart3 className="h-5 w-5 text-yellow-400" />
                          <div>
                            <div className="font-medium">
                              Manage Carbon Credits
                            </div>
                            <div className="text-sm text-slate-400">
                              Approve carbon credits for sale
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/withdraw-fees");
                            setShowOwnerDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3"
                        >
                          <Wallet className="h-5 w-5 text-yellow-400" />
                          <div>
                            <div className="font-medium">
                              Withdraw Platform Fees
                            </div>
                            <div className="text-sm text-slate-400">
                              Collect accumulated platform fees
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Account Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setOpen(!open)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all flex items-center space-x-2"
                  >
                    <span>
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {open && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                      {isRegistered ? (
                        <>
                          <button
                            onClick={() => {
                              navigate(`/profile/${companyId}`);
                              setOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3"
                          >
                            <User className="h-5 w-5 text-emerald-400" />
                            <div>
                              <div className="font-medium">Go to Profile</div>
                              <div className="text-sm text-slate-400">
                                View your company profile
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              navigate("/register-seller");
                              setOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center space-x-3 border-t border-slate-600"
                          >
                            <TreePine className="h-5 w-5 text-emerald-400" />
                            <div>
                              <div className="font-medium">
                                Register as Seller
                              </div>
                              <div className="text-sm text-slate-400">
                                Sell carbon credits
                              </div>
                            </div>
                          </button>
                          <div className="border-t border-slate-600" />
                        </>
                      ) : null}
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-slate-700 transition-colors flex items-center space-x-3"
                      >
                        <Wallet className="h-5 w-5 text-red-400" />
                        <div>
                          <div className="font-medium">Disconnect Wallet</div>
                          <div className="text-sm text-slate-400">
                            Sign out of your account
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
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