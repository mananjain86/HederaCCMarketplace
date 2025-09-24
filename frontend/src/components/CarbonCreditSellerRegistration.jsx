import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  TreePine, Award, ChevronLeft, ChevronRight, Calendar, Zap, Scale, AlertCircle, Hash, MapPin, Globe
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
      if (!formData.projectName) errors.projectName = 'Required';
      if (!formData.projectType) errors.projectType = 'Required';
      if (!formData.projectCountry) errors.projectCountry = 'Required';
      if (!formData.registryUrl) errors.registryUrl = 'Required';
    }
    if (step === 2) {
      if (!formData.accreditedRegistry) errors.accreditedRegistry = 'Required';
      if (!formData.registryStandard) errors.registryStandard = 'Required';
      if (!formData.creditVintage) errors.creditVintage = 'Required';
      if (!formData.serialNumbers) errors.serialNumbers = 'Required';
      if (!formData.amountToSell || parseInt(formData.amountToSell) <= 0) errors.amountToSell = 'Must be > 0';
      if (!formData.pricePerCredit || parseFloat(formData.pricePerCredit) <= 0) errors.pricePerCredit = 'Must be > 0';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const nextStep = () => {
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError('Fix errors before continuing.');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const validation = validateStep(steps.length);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError('Fix all errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (!window.ethereum) throw new Error("MetaMask not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const contractAddress = "0xA60F239a201391765fF86c21E7F4A3c25e35edBA"; // Replace
      const contract = new ethers.Contract(contractAddress, abi, signer);

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
      const pricePerCredit = ethers.parseEther(formData.pricePerCredit);

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

      onRegistrationComplete();
      alert("Carbon credits listed successfully!");

    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Reusable input helpers ---
  const renderInput = (field, label, type = 'text', placeholder = '', required = false) => (
    <div>
      <label className="block text-sm font-medium text-emerald-300 mb-2">{label}{required && '*'}</label>
      <input
        type={type}
        value={formData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:ring-1 ${fieldErrors[field]?'border-red-500':'border-slate-600 focus:border-emerald-500'}`}
        placeholder={placeholder}
      />
      {fieldErrors[field] && <p className="text-red-400 text-sm mt-1"><AlertCircle className="inline mr-1 h-4 w-4"/>{fieldErrors[field]}</p>}
    </div>
  );

  const renderCheckbox = (field, label) => (
    <div className="flex items-center space-x-2">
      <input type="checkbox" checked={formData[field] || false} onChange={(e)=>handleInputChange(field, e.target.checked)} className="h-4 w-4"/>
      <span className="text-emerald-300">{label}</span>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Project Information</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput('projectName','Project Name','text','Example Project',true)}
        {renderInput('projectId','Project ID','text','VCS-123456')}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-emerald-300 mb-2">Project Type *</label>
          <select value={formData.projectType} onChange={e=>handleInputChange('projectType',e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
            <option value="">Select type</option>
            <option>Reforestation</option>
            <option>Afforestation</option>
            <option>Clean Energy</option>
            <option>Other</option>
          </select>
        </div>
        {renderInput('projectCountry','Project Country','text','Kenya',true)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput('projectRegion','Project Region')}
        {renderInput('projectAddress','Account Id (0x...)', 'text','',true)}
      </div>
      {renderInput('registryUrl','Registry URL','url','https://registry.example.org',true)}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Documentation & Credit Details</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <select value={formData.accreditedRegistry} onChange={e=>handleInputChange('accreditedRegistry',e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
          <option value="">Select Accredited Registry</option>
          <option>Verra (VCS)</option>
          <option>Gold Standard</option>
        </select>
        {renderInput('registryStandard','Registry Standard')}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {renderCheckbox('hostCountryAuthorization','Host Country Authorization')}
        {renderCheckbox('parisAgreementCompliant','Paris Agreement Compliant')}
        {renderCheckbox('isVerified','Verified by Third Party')}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput('authorizationLetter','Authorization Letter URL')}
        {renderInput('projectDocumentation','Project Documentation URL')}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {renderInput('creditVintage','Credit Vintage Year','number','2024',true)}
        {renderInput('amountToSell','Total Credits','number','1000',true)}
        {renderInput('pricePerCredit','Price per Credit (ETH)','text','0.01',true)}
      </div>
      {renderInput('serialNumbers','Serial Numbers','text','VCS-1234-2024-1 to VCS-1234-2024-1000',true)}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 bg-slate-800 p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-white mb-6">Carbon Credit Seller Registration</h2>
        {error && <ErrorMessage message={error} />}
        {currentStep===1 && renderStep1()}
        {currentStep===2 && renderStep2()}

        <div className="flex justify-between mt-8">
          <button onClick={onBack} className="text-emerald-300 flex items-center"><ChevronLeft className="h-5 w-5"/> Back</button>
          <div className="space-x-4">
            {currentStep>1 && <button onClick={prevStep} className="text-emerald-300 flex items-center"><ChevronLeft className="h-5 w-5"/> Previous</button>}
            {currentStep<steps.length ? (
              <button onClick={nextStep} className="bg-emerald-500 text-white px-6 py-2 rounded-lg">Next <ChevronRight className="h-5 w-5 inline"/></button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-500 text-white px-6 py-2 rounded-lg disabled:opacity-50">
                {isSubmitting ? <LoadingSpinner size="sm"/> : "List Carbon Credits"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
