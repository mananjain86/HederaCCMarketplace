import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  TreePine, Award, ChevronLeft, ChevronRight, Calendar, Zap, Scale, AlertCircle, Hash, MapPin, Globe, CheckCircle, Building2
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import abi from "../abi/CarbonCreditMarketplace.json";
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

export function CarbonCreditSellerRegistration({ onBack, onRegistrationComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    projectName: '', projectId: '', projectType: '', projectCountry: '',
    projectRegion: '', projectAddress: '', registryUrl: '',
    accreditedRegistry: '', registryStandard: '', hostCountryAuthorization: false,
    authorizationLetter: '', parisAgreementCompliant: false, projectDocumentation: '', isVerified: false,
    creditVintage: '', serialNumbers: '', amountToSell: '', pricePerCredit: ''
  });
  const { toast } = useToast();

  const steps = [
    { id: 1, title: 'Project Information', icon: TreePine },
    { id: 2, title: 'Documentation & Credits', icon: Award }
  ];
  const navigate = useNavigate();
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setError('');
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.projectName) errors.projectName = 'Project name is required';
      if (!formData.projectType) errors.projectType = 'Project type is required';
      if (!formData.projectCountry) errors.projectCountry = 'Project country is required';
      if (!formData.registryUrl) errors.registryUrl = 'Registry URL is required';
    }
    if (step === 2) {
      if (!formData.accreditedRegistry) errors.accreditedRegistry = 'Accredited registry is required';
      if (!formData.registryStandard) errors.registryStandard = 'Registry standard is required';
      if (!formData.creditVintage) errors.creditVintage = 'Credit vintage year is required';
      if (!formData.serialNumbers) errors.serialNumbers = 'Serial numbers are required';
      if (!formData.amountToSell || parseInt(formData.amountToSell) <= 0) errors.amountToSell = 'Amount must be greater than 0';
      if (!formData.pricePerCredit || parseFloat(formData.pricePerCredit) <= 0) errors.pricePerCredit = 'Price must be greater than 0';
    }
    setFieldErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      if (!window.ethereum) {
        toast.error("Please install MetaMask!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const CarbonMarketplaceContract = import.meta.env.VITE_CARBON_CONTRACT_ADDRESS || '0x2b22Ed957d4A0D7cF11Fe049e936a94b2EF05Fb6';
      const contract = new ethers.Contract(CarbonMarketplaceContract, abi, signer);

      // Map form data to contract structs
      const projectInfo = {
        projectName: formData.projectName,
        projectType: formData.projectType,
        projectCountry: formData.projectCountry,
        projectRegion: formData.projectRegion,
        projectAddress: formData.projectAddress,
        registryUrl: formData.registryUrl
      };

      const documentation = {
        accreditedRegistry: formData.accreditedRegistry,
        registryStandard: formData.registryStandard,
        hostCountryAuthorization: formData.hostCountryAuthorization,
        authorizationLetter: formData.authorizationLetter,
        parisAgreementCompliant: formData.parisAgreementCompliant,
        projectDocumentation: formData.projectDocumentation,
        isVerified: formData.isVerified
      };

      const creditDetails = {
        creditVintageYear: parseInt(formData.creditVintage),
        vintageSerialNumbers: formData.serialNumbers
      };

      const amount = BigInt(formData.amountToSell);
      const pricePerCredit = ethers.parseUnits(formData.pricePerCredit,8);

      console.log("Submitting:", { amount, pricePerCredit, projectInfo, documentation, creditDetails });

      const tx = await contract.listCarbonCredits({
        amount,
        pricePerCredit,
        info: projectInfo,
        docs: documentation,
        details: creditDetails
      });

      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed.");

      toast.success("🎉 Carbon credit listing created successfully!");
      onRegistrationComplete?.({
        message: "Carbon credits listed successfully!",
        creditData: formData,
        transactionHash: tx.hash,
      });
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === 4001) {
        setError("Transaction was rejected by user.");
      } else if (err.code === -32603) {
        setError("Internal JSON-RPC error. Please try again.");
      } else if (err.message.includes("insufficient funds")) {
        setError("Insufficient funds for gas fees.");
      } else {
        setError(`Registration failed: ${err.message || "Please try again."}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable input helpers matching company registration style
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

  const renderSelectWithError = (field, label, options, required = false) => (
    <div className="mb-2">
      <label className="block text-base font-semibold text-[#1b4332] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={formData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className={`w-full px-4 py-3 bg-white/70 border rounded-xl text-[#1b4332] focus:border-[#4a6741] focus:ring-2 focus:ring-[#4a6741] shadow-sm ${
          fieldErrors[field] 
            ? 'border-red-400 focus:border-red-500 focus:ring-red-400' 
            : 'border-[#3a5a40]/20'
        }`}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
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
        <h3 className="text-3xl font-extrabold text-[#1b4332] mb-2 tracking-tight">Project Information</h3>
        <p className="text-lg text-[#3a5a40]/80">Details about your carbon credit project</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError('projectName', 'Project Name', 'text', 'Example Project', true, Building2)}
        {renderInputWithError('projectId', 'Project ID', 'text', 'VCS-123456', false, Hash)}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderSelectWithError('projectType', 'Project Type', ['Reforestation', 'Afforestation', 'Clean Energy', 'Renewable Energy', 'Energy Efficiency', 'Other'], true)}
        {renderInputWithError('projectCountry', 'Project Country', 'text', 'Kenya', true, Globe)}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError('projectRegion', 'Project Region', 'text', 'Central Kenya', false, MapPin)}
        {renderInputWithError('projectAddress', 'Project Address/Location', 'text', 'Detailed project location', true, MapPin)}
      </div>

      <div>
        {renderInputWithError('registryUrl', 'Registry URL', 'url', 'https://registry.example.org', true, Globe)}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-extrabold text-[#1b4332] mb-2 tracking-tight">Documentation & Credit Details</h3>
        <p className="text-lg text-[#3a5a40]/80">Registry information and credit specifications</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderSelectWithError('accreditedRegistry', 'Accredited Registry', ['Verra (VCS)', 'Gold Standard', 'Climate Action Reserve', 'American Carbon Registry'], true)}
        {renderInputWithError('registryStandard', 'Registry Standard', 'text', 'VCS Version 4', true)}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError('authorizationLetter', 'Authorization Letter URL', 'url', 'https://example.com/auth-letter.pdf')}
        {renderInputWithError('projectDocumentation', 'Project Documentation URL', 'url', 'https://example.com/project-docs.pdf')}
      </div>

      <div className="bg-white/60 rounded-2xl p-6 border border-[#3a5a40]/20">
        <div className="flex items-start space-x-3">
          <Scale className="h-6 w-6 text-[#4a6741] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-lg font-bold text-[#1b4332] mb-2">Compliance & Verification</h4>
            <p className="text-[#3a5a40]/80 mb-4">
              Confirm your project meets international standards and regulatory requirements.
            </p>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hostCountryAuthorization}
                  onChange={(e) => handleInputChange('hostCountryAuthorization', e.target.checked)}
                  className="w-5 h-5 text-[#4a6741] bg-white border-[#3a5a40]/20 rounded focus:ring-[#4a6741] focus:ring-2"
                />
                <span className="text-[#1b4332] font-semibold">Host Country Authorization</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.parisAgreementCompliant}
                  onChange={(e) => handleInputChange('parisAgreementCompliant', e.target.checked)}
                  className="w-5 h-5 text-[#4a6741] bg-white border-[#3a5a40]/20 rounded focus:ring-[#4a6741] focus:ring-2"
                />
                <span className="text-[#1b4332] font-semibold">Paris Agreement Compliant</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => handleInputChange('isVerified', e.target.checked)}
                  className="w-5 h-5 text-[#4a6741] bg-white border-[#3a5a40]/20 rounded focus:ring-[#4a6741] focus:ring-2"
                />
                <span className="text-[#1b4332] font-semibold">Third-Party Verified</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {renderInputWithError('creditVintage', 'Credit Vintage Year', 'number', '2024', true, Calendar)}
        {renderInputWithError('amountToSell', 'Total Credits', 'number', '1000', true)}
        {renderInputWithError('pricePerCredit', 'Price per Credit (HBAR)', 'text', '0.01', true)}
      </div>

      <div>
        {renderInputWithError('serialNumbers', 'Serial Numbers', 'text', 'VCS-1234-2024-1 to VCS-1234-2024-1000', true, Hash)}
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
              <h2 className="text-3xl font-bold text-[#1b4332]">Carbon Credit Seller Registration</h2>
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
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#1b4332] to-[#3a5a40] text-white px-8 py-3 rounded-full font-bold hover:from-[#3a5a40] hover:to-[#1b4332] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner message="Listing Credits..." size="sm" />
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5" />
                    <span>List Carbon Credits</span>
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
