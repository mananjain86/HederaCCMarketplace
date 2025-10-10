import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  TreePine, Award, ChevronLeft, ChevronRight, Calendar, Zap, Scale, AlertCircle, Hash, MapPin, Globe, CheckCircle, Building2
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import abi from "../abi/CarbonCreditMarketplace.json";

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

  const steps = [
    { id: 1, title: 'Project Information', icon: TreePine },
    { id: 2, title: 'Documentation & Credits', icon: Award }
  ];

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

      onRegistrationComplete?.({
        message: "Carbon credits listed successfully!",
        creditData: formData,
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
        setError(`Registration failed: ${err.message || "Please try again."}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable input helpers matching company registration style
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

  const renderSelectWithError = (field, label, options, required = false) => (
    <div>
      <label className="block text-sm font-medium text-emerald-300 mb-2">
        {label} {required && '*'}
      </label>
      <select
        value={formData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:ring-1 transition-colors ${
          fieldErrors[field] 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-slate-600 focus:border-emerald-500 focus:ring-emerald-500'
        }`}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
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
        <h3 className="text-2xl font-bold text-white mb-2">Project Information</h3>
        <p className="text-slate-400">Details about your carbon credit project</p>
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
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Documentation & Credit Details</h3>
        <p className="text-slate-400">Registry information and credit specifications</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderSelectWithError('accreditedRegistry', 'Accredited Registry', ['Verra (VCS)', 'Gold Standard', 'Climate Action Reserve', 'American Carbon Registry'], true)}
        {renderInputWithError('registryStandard', 'Registry Standard', 'text', 'VCS Version 4', true)}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError('authorizationLetter', 'Authorization Letter URL', 'url', 'https://example.com/auth-letter.pdf')}
        {renderInputWithError('projectDocumentation', 'Project Documentation URL', 'url', 'https://example.com/project-docs.pdf')}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
        <div className="flex items-start space-x-3">
          <Scale className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-2">Compliance & Verification</h4>
            <p className="text-slate-300 mb-4">
              Confirm your project meets international standards and regulatory requirements.
            </p>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hostCountryAuthorization}
                  onChange={(e) => handleInputChange('hostCountryAuthorization', e.target.checked)}
                  className="w-5 h-5 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <span className="text-white font-medium">Host Country Authorization</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.parisAgreementCompliant}
                  onChange={(e) => handleInputChange('parisAgreementCompliant', e.target.checked)}
                  className="w-5 h-5 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <span className="text-white font-medium">Paris Agreement Compliant</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => handleInputChange('isVerified', e.target.checked)}
                  className="w-5 h-5 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <span className="text-white font-medium">Third-Party Verified</span>
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
              <h2 className="text-3xl font-bold text-white">Carbon Credit Seller Registration</h2>
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
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Listing Credits...</span>
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
      </div>
    </div>
  );
}
