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
} from "lucide-react";
import { ethers } from "ethers";
import { useNavigate, Link } from "react-router-dom";
import COMPANY_ABI from "../abi/HandleCompany.json";
// NEW: Import your new contract's ABI
// Make sure you create this file in your /abi/ folder
import FOREST_ABI from "../abi/ForestTokenMarketplace.json";
import { useToast } from "../hooks/useToast";

const COMPANY_ADDRESS =
  import.meta.env.VITE_COMPANY_CONTRACT_ADDRESS ||
  "0x6136a57179ddb0FeF580724263BDc73c96B31863";

const FOREST_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS || // <-- Make sure to set this in your .env
  "0xD8a0C3B0CB1FDc61262772eE502a97C74dbA86B9"; 


export function Navbar() {
  const [companyId, setCompanyId] = useState(null);
  const [account, setAccount] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // This is now for the PLATFORM ADMIN
  const [isGovernment, setIsGovernment] = useState(false); // NEW: State for the Government role
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showGovDropdown, setShowGovDropdown] = useState(false); // NEW: State for Government dropdown
  const ownerDropdownRef = useRef(null);
  const govDropdownRef = useRef(null); // NEW: Ref for Government dropdown
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // separate dropdown states
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
    setIsGovernment(false); // NEW: Reset government state
    toast.info("Wallet disconnected successfully!");
  };

  // UPDATED: This function now checks for the PLATFORM ADMIN (`owner`)
  const checkOwnership = async (addr) => {
    if (!addr || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        FOREST_ADDRESS,
        FOREST_ABI,
        provider
      );
      // This still works, as your new contract has a public `owner` variable
      const ownerAddress = await contract.owner();
      setIsOwner(ownerAddress.toLowerCase() === addr.toLowerCase());
    } catch (err) {
      console.error("Failed to check ownership:", err);
      setIsOwner(false);
    }
  };

  // NEW: This function checks for the `governmentRegistrar` role
  const checkGovernmentStatus = async (addr) => {
    if (!addr || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        FOREST_ADDRESS,
        FOREST_ABI,
        provider
      );
      // Your new contract has a public `governmentRegistrar` variable
      const govAddress = await contract.governmentRegistrar();
      setIsGovernment(govAddress.toLowerCase() === addr.toLowerCase());
    } catch (err) {
      console.error("Failed to check government status:", err);
      setIsGovernment(false);
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
          setIsOwner(false);
          setIsGovernment(false); // NEW: Reset on account change
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
    if (account) {
      checkCompanyRegistration(account);
      checkOwnership(account);
      checkGovernmentStatus(account); // NEW: Check government status on account load
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
      // NEW: Add handler for government dropdown
      if (
        govDropdownRef.current &&
        !govDropdownRef.current.contains(event.target)
      ) {
        setShowGovDropdown(false);
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
          </div>

          {/* Wallet + Register/Profile/Owner */}
          <div className="flex items-center space-x-4">
            {account ? (
              <>
                {/* Profile or Register */}
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

                {/* NEW: Government Actions Dropdown */}
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
                            // This link matches the `registerForest` function
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
                        {/* NEW: Add pages for other government functions */}
                        <button
                          onClick={() => {
                            navigate("/manage-relayers"); // You will need to create this page
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

                {/* UPDATED: Platform Admin Actions (formerly "Owner Actions") */}
                {isOwner && (
                  <div className="relative" ref={ownerDropdownRef}>
                    <button
                      onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                      className="border border-yellow-400 text-yellow-400 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400/10 transition-all flex items-center space-x-2"
                    >
                      {/* UPDATED: Renamed to be more specific */}
                      <span>Admin Actions</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showOwnerDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                        {/* NOTE: "List New Forest Area" was REMOVED from here.
                          It is now in the "Government Actions" dropdown.
                          The remaining links are assumed to be for the platform admin.
                        */}
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
                              approve companies to trade tokens
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
                          {/* UPDATED: Icon changed from TreePine */}
                          <ShieldPlus className="h-5 w-5 text-yellow-400" />
                          <div>
                            <div className="font-medium">
                              Verify Registered Companies
                            </div>
                            <div className="text-sm text-slate-400">
                              check if the registered companies are not fake
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
                          {/* UPDATED: Icon changed from TreePine */}
                          <BarChart3 className="h-5 w-5 text-yellow-400" />
                          <div>
                            <div className="font-medium">
                              Manage Carbon Credits
                            </div>
                            <div className="text-sm text-slate-400">
                              Approve carbon credits to a company for sale
                            </div>
                          </div>
                        </button>
                        {/* NEW: Add link for withdrawFees() */}
                        <button
                          onClick={() => {
                            navigate("/withdraw-fees"); // You will need to create this page
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

                {/* Account Actions Dropdown */}
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