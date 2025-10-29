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
  Award, // NEW
  Shield, // NEW
  PieChart, // NEW
  TrendingDown, // NEW
  TrendingUp, // NEW
} from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
// UPDATED: Import the new ABI
import abi from "../abi/ForestTokenMarketplace.json";
import { useNavigate } from "react-router-dom";

// UPDATED: Renamed component to better reflect its new role
export function ForestSellerRegistration({ onBack, onRegistrationComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // UPDATED: Form state with new fields
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

  // UPDATED: New 3-step process
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

  // UPDATED: Validation logic for new 3-step form
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

  // UPDATED: handleSubmit to call the new registerForest function
  const handleSubmit = async () => {
    // Validate the final step before submitting
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

      // UPDATED: Use the new .env variable for the new contract
      const ForestContractAddress =
        import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
        "0xD8a0C3B0CB1FDc61262772eE502a97C74dbA86B9";

      // UPDATED: Use the new ABI
      const contract = new ethers.Contract(ForestContractAddress, abi, signer);

      // 1. Assemble the AreaInfo struct
      const info = {
        location: formData.location,
        gpsCoordinates: formData.gpsCoordinates,
        areaSize: BigInt(formData.areaSize),
        ipfsDeedHash: formData.ipfsDeedHash,
      };

      // 2. Get all other arguments
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

      // 3. Call the new contract function
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
        // UPDATED: Show clearer contract revert reasons
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
      <label className="block text-sm font-medium text-emerald-300 mb-2">
        {label} {required && "*"}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
        )}
        <input
          type={type}
          value={formData[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full ${
            Icon ? "pl-11" : "pl-4"
          } pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors ${
            fieldErrors[field]
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
          }`}
          placeholder={placeholder}
        />
      </div>
      {fieldErrors[field] && (
        <p className="mt-1 text-sm text-red-400 flex items-center">
          {fieldErrors[field]}
        </p>
      )}
    </div>
  );

  // UPDATED: Renders 3 steps
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
              currentStep >= step.id
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-slate-600 text-slate-400"
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
                currentStep > step.id ? "bg-emerald-500" : "bg-slate-600"
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
    <div className="min-h-screen bg-gradient-to-r from-slate-900 to-emerald-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-emerald-500/20 p-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Marketplace</span>
            </button>
            <div className="text-center">
              {/* UPDATED: Title */}
              <h2 className="text-3xl font-bold text-white">
                Register New Forest Area
              </h2>
              <p className="text-slate-400 mt-1">
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
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? "text-slate-500 cursor-not-allowed"
                  : "text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner message="Registering Area..." size="sm" />
                  </>
                ) : (
                  <>
                    <Hash className="h-5 w-5" />
                    {/* UPDATED: Button text */}
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