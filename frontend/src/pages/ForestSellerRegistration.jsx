import React, { useState } from "react";
import { ethers } from "ethers";
import {
  TreePine,
  MapPin,
  Ruler,
  Hash,
  Globe,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  Award,
  Shield,
  PieChart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import abi from "../abi/ForestTokenMarketplace.json";
import { useNavigate } from "react-router-dom";

export function ForestSellerRegistration({ onBack, onRegistrationComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    location: "",
    gpsCoordinates: "",
    areaSize: "",
    ipfsDeedHash: "",
    htsTokenId: "", // NEW
    serial: "", // NEW
    totalShares: "", // NEW
    baseline: "", // NEW
    potential: "", // NEW
  });
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: "Core Forest Details", icon: TreePine },
    { id: 2, title: "Token & Shares", icon: Award },
    { id: 3, title: "Sequestration Data", icon: TrendingUp },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    setError("");
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.location) errors.location = "Location is required";
      if (!formData.gpsCoordinates)
        errors.gpsCoordinates = "GPS coordinates required";
      if (!formData.areaSize || parseInt(formData.areaSize) <= 0)
        errors.areaSize = "Area size must be greater than 0";
      if (!formData.ipfsDeedHash)
        errors.ipfsDeedHash = "Deed hash/IPFS link required";
    }
    if (step === 2) {
      if (!formData.htsTokenId) errors.htsTokenId = "HTS Token ID is required";
      if (!formData.serial || BigInt(formData.serial) <= 0)
        errors.serial = "Serial number must be greater than 0";
      if (!formData.totalShares || BigInt(formData.totalShares) <= 0)
        errors.totalShares = "Total shares must be greater than 0";
    }
    if (step === 3) {
      if (formData.baseline === "" || BigInt(formData.baseline) < 0)
        errors.baseline = "Baseline must be 0 or greater";
      if (formData.potential === "" || BigInt(formData.potential) < 0)
        errors.potential = "Potential must be 0 or greater";
    }
    setFieldErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const nextStep = () => {
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      setError("Please correct the errors below before continuing.");
      return;
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setError("");
      setFieldErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
      setFieldErrors({});
    }
  };

  const handleSubmit = async () => {
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      setError("Please correct all errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (!window.ethereum) throw new Error("MetaMask not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const ForestContractAddress =
        import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
        "0xD8a0C3B0CB1FDc61262772eE502a97C74dbA86B9";

      const contract = new ethers.Contract(ForestContractAddress, abi, signer);

      const info = {
        location: formData.location,
        gpsCoordinates: formData.gpsCoordinates,
        areaSize: BigInt(formData.areaSize),
        ipfsDeedHash: formData.ipfsDeedHash,
      };

      const htsTokenId = formData.htsTokenId;
      const serial = BigInt(formData.serial);
      const totalShares = BigInt(formData.totalShares);
      const baseline = BigInt(formData.baseline);
      const potential = BigInt(formData.potential);

      console.log("Submitting:", {
        htsTokenId,
        serial,
        info,
        totalShares,
        baseline,
        potential,
      });

      const tx = await contract.registerForest(
        htsTokenId,
        serial,
        info,
        totalShares,
        baseline,
        potential
      );

      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed.");

      onRegistrationComplete?.({
        message: "Forest area registered successfully!",
        forestData: formData,
        transactionHash: tx.hash,
      });
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === 4001) {
        setError("Transaction was rejected by user.");
      } else if (err.reason) {
        setError(`Registration failed: ${err.reason}`);
      } else if (err.message.includes("insufficient funds")) {
        setError("Insufficient funds for gas fees.");
      } else {
        setError(`Registration failed: ${err.message || "Please try again."}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Reusable Inputs ---
  const renderInputWithError = (
    field,
    label,
    type = "text",
    placeholder = "",
    required = false,
    Icon = null
  ) => (
    <div>
      <label className="block text-sm font-semibold text-[#1b4332] mb-2">
        {label} {required && "*"}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3.5 h-5 w-5 text-[#3a5a40]/60" />
        )}
        <input
          type={type}
          value={formData[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full ${
            Icon ? "pl-11" : "pl-4"
          } pr-4 py-3 bg-white/70 border rounded-xl text-[#1b4332] placeholder-[#3a5a40]/40 focus:ring-2 focus:ring-[#4a6741] focus:border-[#4a6741] transition-all ${
            fieldErrors[field]
              ? "border-red-400 focus:border-red-500 focus:ring-red-400"
              : "border-[#3a5a40]/20"
          }`}
          placeholder={placeholder}
        />
      </div>
      {fieldErrors[field] && (
        <p className="mt-1 text-sm text-red-500 flex items-center font-semibold">
          {fieldErrors[field]}
        </p>
      )}
    </div>
  );

  // --- Stepper ---
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all text-lg font-bold ${
              currentStep >= step.id
                ? "bg-gradient-to-r from-[#1b4332] to-[#40916c] border-[#40916c] text-white shadow-lg"
                : "border-[#3a5a40]/30 text-[#3a5a40] bg-white/60"
            }`}
          >
            {currentStep > step.id ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <step.icon className="h-5 w-5" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-16 mx-2 transition-all ${
                currentStep > step.id ? "bg-[#40916c]" : "bg-[#3a5a40]/30"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // UPDATED: Step 1 now includes IPFS hash
  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-2 text-center">
        Core Forest Details
      </h3>
      <p className="text-slate-400 mb-6 text-center">
        Provide the basic location and documentation details.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError(
          "location",
          "Location",
          "text",
          "e.g., Amazon Rainforest Sector 4A",
          true,
          MapPin
        )}
        {renderInputWithError(
          "gpsCoordinates",
          "GPS Coordinates",
          "text",
          "e.g., 3.4653° S, 62.2159° W",
          true,
          Globe
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError(
          "areaSize",
          "Area Size (sq. meters)",
          "number",
          "10000",
          true,
          Ruler
        )}
        {renderInputWithError(
          "ipfsDeedHash",
          "IPFS Deed Hash/Link",
          "text",
          "Qm... or https://ipfs.io/ipfs/...",
          true,
          FileText
        )}
      </div>
    </div>
  );

  // NEW: Step 2 for Token & Share info
  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-2 text-center">
        Token & Share Details
      </h3>
      <p className="text-slate-400 mb-6 text-center">
        Enter the HTS token info and fractionalization details.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError(
          "htsTokenId",
          "HTS Token ID",
          "text",
          "e.g., 0.0.123456",
          true,
          Award
        )}
        {renderInputWithError(
          "serial",
          "Serial Number",
          "number",
          "1",
          true,
          Shield
        )}
      </div>

      <div>
        {renderInputWithError(
          "totalShares",
          "Total Shares",
          "number",
          "10000",
          true,
          PieChart
        )}
        <p className="text-sm text-slate-400 mt-2 ml-1">
          The total number of fractional units this NFT will be divided into
          (e.g., 10,000 shares).
        </p>
      </div>
    </div>
  );

  // NEW: Step 3 for Sequestration data (replaces old step 2)
  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-2 text-center">
        Sequestration Data
      </h3>
      <p className="text-slate-400 mb-6 text-center">
        Provide the carbon sequestration projections for this area.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError(
          "baseline",
          "Baseline Sequestration (per year)",
          "number",
          "50000",
          true,
          TrendingDown
        )}
        {renderInputWithError(
          "potential",
          "Potential Sequestration (per year)",
          "number",
          "150000",
          true,
          TrendingUp
        )}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea] text-[#0f2d1c] py-12 px-4 overflow-hidden">
      {/* --- Subtle Gradient Green Backgrounds (Home style) --- */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)" }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)" }} />
        <div className="absolute left-1/2 top-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20"
          style={{ background: "conic-gradient(from 90deg at 50% 50%, #d8f3dc 0deg, #74c69d 120deg, #b7e4c7 240deg, #d8f3dc 360deg)" }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-[#3a5a40]/20 p-10 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-[#40916c] hover:text-[#1b4332] transition-colors font-semibold"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Marketplace</span>
            </button>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-[#1b4332] tracking-tight">
                Register New Forest Area
              </h2>
              <p className="text-[#3a5a40] mt-1">
                Step {currentStep} of {steps.length}
              </p>
            </div>
            <div className="w-24" />
          </div>

          {renderStepIndicator()}

          {error && <ErrorMessage message={error} className="mb-6" />}

          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold transition-all ${
                currentStep === 1
                  ? "text-[#3a5a40]/40 cursor-not-allowed"
                  : "text-[#40916c] hover:bg-[#b7e4c7]/30"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white px-8 py-3 rounded-full font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all"
              >
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white px-8 py-3 rounded-full font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner message="Registering Area..." size="sm" />
                  </>
                ) : (
                  <>
                    <Hash className="h-5 w-5" />
                    <span>Register Forest Area</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}