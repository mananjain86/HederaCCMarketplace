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
  Radio,
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
  const [isRelayer, setIsRelayer] = useState(false);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showGovDropdown, setShowGovDropdown] = useState(false);
  const [showRelayerDropdown, setShowRelayerDropdown] = useState(false);
  const ownerDropdownRef = useRef(null);
  const govDropdownRef = useRef(null);
  const relayerDropdownRef = useRef(null);
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
    setIsRelayer(false);
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

  // Check if account is a relayer
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
          setIsRelayer(false);
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
      checkRelayerStatus(account);
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
    <nav className="bg-white border-b border-[#3a5a40]/10 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#e8f1ea] transition-all"
          >
            <Leaf className="h-9 w-9 text-[#4a6741]" />
            <span className="text-2xl font-extrabold text-[#1b4332] tracking-tight">
              CarbonChain
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/marketplace"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#1b4332] font-medium hover:bg-[#e8f1ea] transition-all"
            >
              <Building2 className="h-5 w-5" />
              <span>Marketplace</span>
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#1b4332] font-medium hover:bg-[#e8f1ea] transition-all"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </Link>
            <Link
              to="/dao"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#1b4332] font-medium hover:bg-[#e8f1ea] transition-all"
            >
              <BarChart3 className="h-5 w-5" />
              <span>DAO</span>
            </Link>
          </div>

          {/* Wallet + Role-based Dropdowns */}
          <div className="flex items-center gap-2">
            {account ? (
              <>
                {/* Register Dropdown (if not registered) */}
                {!isRegistered && (
                  <div className="relative" ref={registerDropdownRef}>
                    <button
                      onClick={() =>
                        setShowRegisterDropdown(!showRegisterDropdown)
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#4a6741] text-[#1b4332] font-semibold bg-white hover:bg-[#e8f1ea] transition-all"
                    >
                      <Users className="h-5 w-5" />
                      <span>Register</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showRegisterDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-[#3a5a40]/20 rounded-xl shadow-xl z-50">
                        <button
                          onClick={() => {
                            navigate("/register");
                            setShowRegisterDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[#1b4332] hover:bg-[#e8f1ea] transition-colors flex items-center gap-3"
                        >
                          <Users className="h-5 w-5 text-[#4a6741]" />
                          <div>
                            <div className="font-semibold">
                              Basic Company Registration
                            </div>
                            <div className="text-sm text-[#3a5a40]/70">
                              KYC/KYB and general company setup
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/register-seller");
                            setShowRegisterDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[#1b4332] hover:bg-[#e8f1ea] transition-colors flex items-center gap-3 border-t border-[#3a5a40]/10"
                        >
                          <TreePine className="h-5 w-5 text-[#4a6741]" />
                          <div>
                            <div className="font-semibold">
                              Carbon Credit Seller
                            </div>
                            <div className="text-sm text-[#3a5a40]/70">
                              Register as a project developer
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Relayer Actions Dropdown */}
                {isRelayer && (
                  <div className="relative" ref={relayerDropdownRef}>
                    <button
                      onClick={() => setShowRelayerDropdown(!showRelayerDropdown)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[purple] text-[purple] font-semibold bg-white hover:bg-[#e8f1ea] transition-all"
                    >
                      <Radio className="h-5 w-5 text-[purple]" />
                      <span>Relayer</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showRelayerDropdown && (
                      <div className="absolute right-0 mt-2 w-72 bg-white border border-[purple]/20 rounded-xl shadow-xl z-50">
                        <button
                          onClick={() => {
                            navigate("/relayer-dashboard");
                            setShowRelayerDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[purple] hover:bg-[#e8f1ea] transition-colors flex items-center gap-3"
                        >
                          <TreePine className="h-5 w-5 text-[purple]" />
                          <div>
                            <div className="font-semibold">
                              Update Forest Regeneration
                            </div>
                            <div className="text-sm text-[purple]">
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
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2563eb] text-[#2563eb] font-semibold bg-white hover:bg-[#e0e7ff] transition-all"
                    >
                      <ShieldPlus className="h-5 w-5" />
                      <span>Government</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showGovDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-[#2563eb]/20 rounded-xl shadow-xl z-50">
                        <button
                          onClick={() => {
                            navigate("/forest-seller-registration");
                            setShowGovDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[#2563eb] hover:bg-[#e0e7ff] transition-colors flex items-center gap-3"
                        >
                          <TreePine className="h-5 w-5 text-[#2563eb]" />
                          <div>
                            <div className="font-semibold">
                              List New Forest Area
                            </div>
                            <div className="text-sm text-[#2563eb]/70">
                              Create a new listing for sale
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/manage-relayers");
                            setShowGovDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[#2563eb] hover:bg-[#e0e7ff] transition-colors flex items-center gap-3"
                        >
                          <Users className="h-5 w-5 text-[#2563eb]" />
                          <div>
                            <div className="font-semibold">Manage Relayers</div>
                            <div className="text-sm text-[#2563eb]/70">
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
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#eab308] text-[#eab308] font-semibold bg-white hover:bg-[#e8f1ea] transition-all"
                    >
                      <ShieldPlus className="h-5 w-5" />
                      <span>Admin</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showOwnerDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-[#eab308]/20 rounded-xl shadow-xl z-50">
                        <button
                          onClick={() => {
                            navigate("/grant-kyc");
                            setShowOwnerDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[#eab308] hover:bg-[#e8f1ea] transition-colors flex items-center gap-3"
                        >
                          <ShieldPlus className="h-5 w-5 text-[#eab308]" />
                          <div>
                            <div className="font-semibold">Grant Token KYC</div>
                            <div className="text-sm text-[#eab308]/70">
                              Approve companies to trade tokens
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/verify-company");
                            setShowOwnerDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[#eab308] hover:bg-[#e8f1ea] transition-colors flex items-center gap-3"
                        >
                          <ShieldPlus className="h-5 w-5 text-[#eab308]" />
                          <div>
                            <div className="font-semibold">
                              Verify Registered Companies
                            </div>
                            <div className="text-sm text-[#eab308]/70">
                              Check if registered companies are legitimate
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/manage-credits");
                            setShowOwnerDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[#eab308] hover:bg-[#e8f1ea] transition-colors flex items-center gap-3"
                        >
                          <BarChart3 className="h-5 w-5 text-[#eab308]" />
                          <div>
                            <div className="font-semibold">
                              Manage Carbon Credits
                            </div>
                            <div className="text-sm text-[#eab308]/70">
                              Approve carbon credits for sale
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/withdraw-fees");
                            setShowOwnerDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[#eab308] hover:bg-[#e8f1ea] transition-colors flex items-center gap-3"
                        >
                          <Wallet className="h-5 w-5 text-[#eab308]" />
                          <div>
                            <div className="font-semibold">
                              Withdraw Platform Fees
                            </div>
                            <div className="text-sm text-[#eab308]/70">
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1b4332] to-[#4a6741] text-white font-semibold hover:from-[#14532d] hover:to-[#166534] transition-all"
                  >
                    <span>
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {open && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-[#3a5a40]/20 rounded-xl shadow-xl z-50">
                      {isRegistered && (
                        <>
                          <button
                            onClick={() => {
                              navigate(`/profile/${companyId}`);
                              setOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-[#1b4332] hover:bg-[#e8f1ea] transition-colors flex items-center gap-3"
                          >
                            <User className="h-5 w-5 text-[#4a6741]" />
                            <div>
                              <div className="font-semibold">Go to Profile</div>
                              <div className="text-sm text-[#3a5a40]/70">
                                View your company profile
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              navigate("/register-seller");
                              setOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-[#1b4332] hover:bg-[#e8f1ea] transition-colors flex items-center gap-3 border-t border-[#3a5a40]/10"
                          >
                            <TreePine className="h-5 w-5 text-[#4a6741]" />
                            <div>
                              <div className="font-semibold">
                                Register as Seller
                              </div>
                              <div className="text-sm text-[#3a5a40]/70">
                                Sell carbon credits
                              </div>
                            </div>
                          </button>
                          <div className="border-t border-[#3a5a40]/10" />
                        </>
                      )}
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-500 hover:bg-[#fef2f2] transition-colors flex items-center gap-3"
                      >
                        <Wallet className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="font-semibold">Disconnect Wallet</div>
                          <div className="text-sm text-[#3a5a40]/70">
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
                className="flex items-center gap-2 px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-[#1b4332] to-[#4a6741] text-white hover:from-[#14532d] hover:to-[#166534] transition-all"
              >
                <Wallet className="h-5 w-5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}