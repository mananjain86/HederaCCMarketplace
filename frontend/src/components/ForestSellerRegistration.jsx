import React, { useState } from "react";
import { ethers } from "ethers";
import {
  TreePine, MapPin, Ruler, Hash, DollarSign, Globe, ChevronLeft, ChevronRight, CheckCircle, FileText
} from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import abi from "../abi/ForestTokenMarketplace.json";

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
    price: "",
  });

  const steps = [
    { id: 1, title: "Forest Information", icon: TreePine },
    { id: 2, title: "Pricing & Documentation", icon: DollarSign },
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
      if (!formData.gpsCoordinates) errors.gpsCoordinates = "GPS coordinates required";
      if (!formData.areaSize || parseInt(formData.areaSize) <= 0)
        errors.areaSize = "Area size must be greater than 0";
    }
    if (step === 2) {
      if (!formData.ipfsDeedHash) errors.ipfsDeedHash = "Deed hash/IPFS link required";
      if (!formData.price || parseFloat(formData.price) <= 0)
        errors.price = "Price must be greater than 0";
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
        "0xYourForestMarketplaceAddress";
      const contract = new ethers.Contract(ForestContractAddress, abi, signer);

      const info = {
        location: formData.location,
        gpsCoordinates: formData.gpsCoordinates,
        areaSize: BigInt(formData.areaSize),
        ipfsDeedHash: formData.ipfsDeedHash,
      };

      const price = ethers.parseEther(formData.price);

      console.log("Submitting:", { info, price });

      const tx = await contract.listForestArea(info, price);

      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed.");

      onRegistrationComplete?.({
        message: "Forest area listed successfully!",
        forestData: formData,
        transactionHash: tx.hash,
      });
    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === 4001) {
        setError("Transaction was rejected by user.");
      } else if (err.code === -32603) {
        setError("Internal JSON-RPC error. Please try again.");
      } else if (err.message.includes("insufficient funds")) {
        setError("Insufficient funds for gas fees.");
      } else {
        setError(`Listing failed: ${err.message || "Please try again."}`);
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

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-2 text-center">
        Forest Information
      </h3>
      <p className="text-slate-400 mb-6 text-center">
        Provide the basic details of the forest area
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError(
          "location",
          "Location",
          "text",
          "Example Forest",
          true,
          MapPin
        )}
        {renderInputWithError(
          "gpsCoordinates",
          "GPS Coordinates",
          "text",
          "12.9716° N, 77.5946° E",
          true,
          Globe
        )}
      </div>

      <div>
        {renderInputWithError(
          "areaSize",
          "Area Size (sq. meters)",
          "number",
          "10000",
          true,
          Ruler
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-2 text-center">
        Pricing & Documentation
      </h3>
      <p className="text-slate-400 mb-6 text-center">
        Upload deed details and set your listing price
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError(
          "ipfsDeedHash",
          "IPFS Deed Hash/Link",
          "text",
          "Qm... or https://ipfs.io/ipfs/...",
          true,
          FileText
        )}
        {renderInputWithError(
          "price",
          "Price (ETH)",
          "text",
          "1.5",
          true,
          DollarSign
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
              <h2 className="text-3xl font-bold text-white">
                Forest Seller Registration
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
                    <LoadingSpinner size="sm" />
                    <span>Listing Area...</span>
                  </>
                ) : (
                  <>
                    <Hash className="h-5 w-5" />
                    <span>List Forest Area</span>
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
