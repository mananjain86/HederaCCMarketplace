import React, { useState } from 'react';
import abi from '../abi/HandleCompany.json';
import { 
  Building2, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Leaf,
  AlertCircle,
  Shield,
  TrendingUp,
  Hash
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { validateStep1, validateStep2 } from '../utils/validation';
import { ethers } from 'ethers';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

const COMPANY_ABI = abi;
const COMPANY_ADDRESS = import.meta.env.VITE_COMPANY_CONTRACT_ADDRESS || "0x6136a57179ddb0FeF580724263BDc73c96B31863";

export function CompanyRegistration({ onBack, onRegistrationComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    hederaAccountId: '',
    legalEntityName: '',
    registrationNumber: '',    
    taxId: '',
    amlCompliance: false,
    scope1Emissions: '',
    scope2Emissions: '',
    scope3Emissions: '',
    emissionsCalculationMethod: '',
    emissionsVerified: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const steps = [
    { id: 1, title: 'General Company Information', icon: Building2 },
    { id: 2, title: 'Carbon Emissions & Climate Strategy', icon: Leaf }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    setError('');
  };

  const validateStep = (step) => {
    let validation;
    switch(step) {
      case 1:
        validation = validateStep1(formData);
        break;
      case 2:
        validation = validateStep2(formData);
        break;
      default:
        return { isValid: true, errors: {} };
    }
    setFieldErrors(validation.errors);
    return validation;
  };

  const nextStep = () => {
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      setError('Please correct the errors below before continuing.');
      return;
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setError('');
      setFieldErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
      setFieldErrors({});
    }
  };

  const handleRegister = async () => {
  console.log("register function called");

  const validation = validateStep(currentStep);
  if (!validation.isValid) {
    setError("Please correct all errors before submitting.");
    return;
  }

  setIsSubmitting(true);
  setError("");

  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    // ✅ ethers v6 provider + signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(COMPANY_ADDRESS, COMPANY_ABI, signer);

    // ✅ Build single struct as per ABI
    const registrationData = {
      name: formData.name || "",
      hederaAccountId: formData.hederaAccountId || "",
      legalEntityName: formData.legalEntityName || "",
      registrationNumber: formData.registrationNumber || "",
      walletAddress: formData.walletAddress || (await signer.getAddress()),
      taxId: formData.taxId || "",
      amlCompliance: formData.amlCompliance || false,
      scope1Emissions: parseInt(formData.scope1Emissions) || 0,
      scope2Emissions: parseInt(formData.scope2Emissions) || 0,
      scope3Emissions: parseInt(formData.scope3Emissions) || 0,
      emissionsCalculationMethod: formData.emissionsCalculationMethod || "",
      emissionsVerified: formData.emissionsVerified || false,
    };

    console.log("Submitting registrationData:", registrationData);

    // ✅ Call contract with single struct
    const tx = await contract.registerCompany(registrationData);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    toast.success("🎉 Company registered successfully!");

    onRegistrationComplete?.({
      message: "Company registration submitted successfully!",
      companyData: formData,
      showSellerOption: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    });
    navigate("/profile");
  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === 4001) {
      setError("Transaction was rejected by user.");
    } else if (err.code === -32603) {
      setError("Internal JSON-RPC error. Please try again.");
    } else if (err.message.includes("insufficient funds")) {
      setError("Insufficient funds for gas fees.");
    } else if (err.message.includes("already registered")) {
      setError("This wallet address is already registered.");
    } else {
      setError(`Registration failed: ${err.message || "Please try again."}`);
    }
  } finally {
    setIsSubmitting(false);
  }
};


  // ✅ Fixed: use Icon component instead of lowercase
  const renderInputWithError = (field, label, type = 'text', placeholder = '', required = false, Icon = null) => (
    <div className="mb-2">
      <label className="block text-base font-semibold text-[#1b4332] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3.5 h-5 w-5 text-[#3a5a40]/60" />}
        <input
          type={type}
          value={formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-white/70 border rounded-xl text-[#1b4332] placeholder-[#3a5a40]/40 focus:ring-2 focus:ring-[#4a6741] focus:border-[#4a6741] shadow-sm transition-all ${
            fieldErrors[field] 
              ? 'border-red-400 focus:border-red-500 focus:ring-red-400' 
              : 'border-[#3a5a40]/20'
          }`}
          placeholder={placeholder}
        />
      </div>
      {fieldErrors[field] && (
        <p className="mt-2 text-base text-red-500 flex items-center font-semibold">
          <AlertCircle className="h-4 w-4 mr-1" />
          {fieldErrors[field]}
        </p>
      )}
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-lg transition-all text-xl font-bold ${
            currentStep >= step.id 
              ? 'bg-gradient-to-br from-[#1b4332] to-[#4a6741] border-[#4a6741] text-white scale-105' 
              : 'bg-white/60 border-[#3a5a40]/20 text-[#3a5a40]/60'
          }`}>
            {currentStep > step.id ? (
              <CheckCircle className="h-6 w-6" />
            ) : (
              <step.icon className="h-6 w-6" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`h-1 w-16 mx-2 rounded transition-all ${
              currentStep > step.id ? 'bg-gradient-to-r from-[#1b4332] to-[#4a6741]' : 'bg-[#3a5a40]/20'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-extrabold text-[#1b4332] mb-2 tracking-tight">General Company Information</h3>
        <p className="text-lg text-[#3a5a40]/80">KYC/KYB verification and basic company details</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError('name', 'Display Name', 'text', 'CarbonTech Solutions')}
        {renderInputWithError('hederaAccountId', 'Hedera Account ID', 'text', '0.0.123456', true, Hash)}
        {renderInputWithError('legalEntityName', 'Legal Entity Name', 'text', 'CarbonTech Solutions LLC', true)}
        {renderInputWithError('registrationNumber', 'Company Registration Number', 'text', '123456789', true)}
      </div>

      <div>
        <label className="block text-base font-semibold text-[#1b4332] mb-2">
          Tax Identification Number (TIN) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.taxId}
          onChange={(e) => handleInputChange('taxId', e.target.value)}
          className="w-full px-4 py-3 bg-white/70 border border-[#3a5a40]/20 rounded-xl text-[#1b4332] placeholder-[#3a5a40]/40 focus:border-[#4a6741] focus:ring-2 focus:ring-[#4a6741] shadow-sm"
          placeholder="XX-XXXXXXX"
        />
      </div>

      <div className="bg-white/60 rounded-2xl p-6 border border-[#3a5a40]/20">
        <div className="flex items-start space-x-3">
          <Shield className="h-6 w-6 text-[#4a6741] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-lg font-bold text-[#1b4332] mb-2">Anti-Money Laundering (AML) Compliance</h4>
            <p className="text-[#3a5a40]/80 mb-4">
              By checking this box, you confirm that your company complies with all applicable 
              Anti-Money Laundering regulations.
            </p>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.amlCompliance}
                onChange={(e) => handleInputChange('amlCompliance', e.target.checked)}
                className="w-5 h-5 text-[#4a6741] bg-white border-[#3a5a40]/20 rounded focus:ring-[#4a6741] focus:ring-2"
              />
              <span className="text-[#1b4332] font-semibold">
                I confirm AML compliance <span className="text-red-500">*</span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-extrabold text-[#1b4332] mb-2 tracking-tight">Carbon Emissions & Climate Strategy</h3>
        <p className="text-lg text-[#3a5a40]/80">Your greenhouse gas emissions data and climate commitments</p>
      </div>

      <div className="bg-white/60 rounded-2xl p-6 border border-[#3a5a40]/20">
        <h4 className="text-lg font-bold text-[#1b4332] mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-[#4a6741] mr-2" />
          Historical Greenhouse Gas (GHG) Emissions Data
        </h4>
        <div className="grid md:grid-cols-3 gap-6">
          {renderInputWithError('scope1Emissions', 'Scope 1 Emissions (tCO₂e)', 'number', '0')}
          {renderInputWithError('scope2Emissions', 'Scope 2 Emissions (tCO₂e)', 'number', '0')}
          {renderInputWithError('scope3Emissions', 'Scope 3 Emissions (tCO₂e)', 'number', '0')}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-base font-semibold text-[#1b4332] mb-2">
            Emissions Calculation Methodology <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.emissionsCalculationMethod}
            onChange={(e) => handleInputChange('emissionsCalculationMethod', e.target.value)}
            className="w-full px-4 py-3 bg-white/70 border border-[#3a5a40]/20 rounded-xl text-[#1b4332] focus:border-[#4a6741] focus:ring-2 focus:ring-[#4a6741] shadow-sm"
          >
            <option value="">Select methodology</option>
            <option value="GHG Protocol">GHG Protocol</option>
            <option value="ISO 14064">ISO 14064</option>
            <option value="CDP">CDP Framework</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea] min-h-screen text-[#0f2d1c]">
      {/* --- Subtle Gradient Green Backgrounds (copied from Home) --- */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20"
          style={{
            background:
              "conic-gradient(from 90deg at 50% 50%, #d8f3dc 0deg, #74c69d 120deg, #b7e4c7 240deg, #d8f3dc 360deg)",
          }}
        />
      </div>
      {/* --- End Gradient Backgrounds --- */}

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-[#3a5a40]/20 p-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-[#4a6741] hover:text-[#1b4332] font-bold transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Marketplace</span>
            </button>
            <div className="text-center flex-1">
              <h2 className="text-3xl font-bold text-[#1b4332]">Company Registration</h2>
              <p className="text-[#3a5a40]/80 mt-1">Step {currentStep} of 2</p>
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
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold transition-all ${
                currentStep === 1
                  ? 'text-[#3a5a40]/40 cursor-not-allowed'
                  : 'text-[#4a6741] hover:bg-[#4a6741]/10'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            {currentStep < 2 ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#1b4332] to-[#3a5a40] text-white px-8 py-3 rounded-full font-bold hover:from-[#3a5a40] hover:to-[#1b4332] transition-all"
              >
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#1b4332] to-[#3a5a40] text-white px-8 py-3 rounded-full font-bold hover:from-[#3a5a40] hover:to-[#1b4332] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner message="Registering..." size="sm" />
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
