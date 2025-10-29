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
    <div>
      <label className="block text-sm font-medium text-emerald-300 mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />}
        <input
          type={type}
          value={formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors ${
            fieldErrors[field] 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-slate-600 focus:border-emerald-500 focus:ring-emerald-500'
          }`}
          placeholder={placeholder}
        />
      </div>
      {fieldErrors[field] && (
        <p className="mt-1 text-sm text-red-400 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {fieldErrors[field]}
        </p>
      )}
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
            currentStep >= step.id 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-slate-600 text-slate-400'
          }`}>
            {currentStep > step.id ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <step.icon className="h-5 w-5" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`h-0.5 w-16 mx-2 transition-all ${
              currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-600'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">General Company Information</h3>
        <p className="text-slate-400">KYC/KYB verification and basic company details</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError('name', 'Display Name', 'text', 'CarbonTech Solutions')}
        {renderInputWithError('hederaAccountId', 'Hedera Account ID', 'text', '0.0.123456', true, Hash)}
        {renderInputWithError('legalEntityName', 'Legal Entity Name', 'text', 'CarbonTech Solutions LLC', true)}
        {renderInputWithError('registrationNumber', 'Company Registration Number', 'text', '123456789', true)}
      </div>

      <div>
        <label className="block text-sm font-medium text-emerald-300 mb-2">
          Tax Identification Number (TIN) *
        </label>
        <input
          type="text"
          value={formData.taxId}
          onChange={(e) => handleInputChange('taxId', e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="XX-XXXXXXX"
        />
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
        <div className="flex items-start space-x-3">
          <Shield className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-2">Anti-Money Laundering (AML) Compliance</h4>
            <p className="text-slate-300 mb-4">
              By checking this box, you confirm that your company complies with all applicable 
              Anti-Money Laundering regulations.
            </p>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.amlCompliance}
                onChange={(e) => handleInputChange('amlCompliance', e.target.checked)}
                className="w-5 h-5 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <span className="text-white font-medium">
                I confirm AML compliance *
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Carbon Emissions & Climate Strategy</h3>
        <p className="text-slate-400">Your greenhouse gas emissions data and climate commitments</p>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-emerald-400 mr-2" />
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
          <label className="block text-sm font-medium text-emerald-300 mb-2">
            Emissions Calculation Methodology *
          </label>
          <select
            value={formData.emissionsCalculationMethod}
            onChange={(e) => handleInputChange('emissionsCalculationMethod', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
              <h2 className="text-3xl font-bold text-white">Company Registration</h2>
              <p className="text-slate-400 mt-1">Step {currentStep} of 2</p>
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
                  ? 'text-slate-500 cursor-not-allowed'
                  : 'text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            {currentStep < 2 ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
}
