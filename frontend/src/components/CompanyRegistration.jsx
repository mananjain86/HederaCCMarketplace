import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  DollarSign, 
  Leaf,
  AlertCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
  Users,
  Shield,
  TrendingUp
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { validateStep1, validateStep2, validateStep3 } from '../utils/validation';

export function CompanyRegistration({ onBack, onRegistrationComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    
    // KYC/KYB Information
    legalEntityName: '',
    registrationNumber: '',
    jurisdiction: '',
    registeredAddress: '',
    principalBusinessAddress: '',
    localPartners: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    socialProfiles: '',
    industry: '',
    businessActivities: '',
    keyIndividualsProof: '',
    
    // Financial and Compliance
    bankAccountDetails: '',
    taxId: '',
    amlCompliance: false,
    
    // Carbon Emissions Data
    scope1Emissions: '',
    scope2Emissions: '',
    scope3Emissions: '',
    emissionsCalculationMethod: '',
    emissionsVerified: false,
    verificationStatement: '',
    decarbonizationStrategy: '',
    climatePledges: ''
  });

  const steps = [
    {
      id: 1,
      title: 'General Company Information',
      icon: Building2,
      description: 'KYC/KYB and basic company details'
    },
    {
      id: 2,
      title: 'Financial & Compliance',
      icon: DollarSign,
      description: 'Banking details and regulatory compliance'
    },
    {
      id: 3,
      title: 'Carbon Emissions & Climate Strategy',
      icon: Leaf,
      description: 'Your emissions data and climate commitments'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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
      case 3:
        validation = validateStep3(formData);
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
    if (currentStep < 3) {
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
    const validation = validateStep(3);
    if (!validation.isValid) {
      setError('Please correct all errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Simulate registration process for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Registration successful - pass company data
      onRegistrationComplete?.({
        message: 'Company registration submitted successfully!',
        companyData: formData,
        showSellerOption: true, // Always show seller option as an upgrade path
        transactionHash: `0x${Math.random().toString(16).slice(2, 10)}`
      });
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputWithError = (field, label, type = 'text', placeholder = '', required = false, icon = null) => (
    <div>
      <label className="block text-sm font-medium text-emerald-300 mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        {icon && <icon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />}
        <input
          type={type}
          value={formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors ${
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
        {renderInputWithError('legalEntityName', 'Legal Entity Name', 'text', 'CarbonTech Solutions LLC', true)}
        {renderInputWithError('registrationNumber', 'Company Registration Number', 'text', '123456789', true)}
        {renderInputWithError('jurisdiction', 'Jurisdiction', 'text', 'Delaware, USA', true)}
        {renderInputWithError('industry', 'Industry', 'text', 'Technology, Manufacturing, etc.')}
      </div>

      <div>
        <label className="block text-sm font-medium text-emerald-300 mb-2">
          Registered Address
        </label>
        <textarea
          value={formData.registeredAddress}
          onChange={(e) => handleInputChange('registeredAddress', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="123 Business Ave, City, State, ZIP"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-emerald-300 mb-2">
          Principal Place of Business
        </label>
        <textarea
          value={formData.principalBusinessAddress}
          onChange={(e) => handleInputChange('principalBusinessAddress', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="456 Operations St, City, State, ZIP"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError('contactName', 'Primary Contact Name', 'text', 'John Doe', true, Users)}
        {renderInputWithError('contactEmail', 'Contact Email', 'email', 'john@company.com', true, Mail)}
        {renderInputWithError('contactPhone', 'Contact Phone', 'tel', '+1 (555) 123-4567', false, Phone)}
        {renderInputWithError('website', 'Company Website', 'url', 'https://company.com', false, Globe)}
      </div>

      <div>
        <label className="block text-sm font-medium text-emerald-300 mb-2">
          Local Partners/Directors
        </label>
        <textarea
          value={formData.localPartners}
          onChange={(e) => handleInputChange('localPartners', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="Key local partners or directors involved in the project"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-emerald-300 mb-2">
          Business Activities Description
        </label>
        <textarea
          value={formData.businessActivities}
          onChange={(e) => handleInputChange('businessActivities', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="Describe your core business operations and activities"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Financial & Compliance Information</h3>
        <p className="text-slate-400">Banking details and regulatory compliance requirements</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-emerald-300 mb-2">
            Bank Account Details
          </label>
          <textarea
            value={formData.bankAccountDetails}
            onChange={(e) => handleInputChange('bankAccountDetails', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="Bank name, account type, and relevant details for transactions"
          />
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
        <div className="flex items-start space-x-3">
          <Shield className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-2">Anti-Money Laundering (AML) Compliance</h4>
            <p className="text-slate-300 mb-4">
              By checking this box, you confirm that your company complies with all applicable 
              Anti-Money Laundering regulations and that you have appropriate policies and 
              procedures in place to prevent money laundering activities.
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

      <div>
        <label className="block text-sm font-medium text-emerald-300 mb-2">
          Proof of Identity for Key Individuals
        </label>
        <textarea
          value={formData.keyIndividualsProof}
          onChange={(e) => handleInputChange('keyIndividualsProof', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="Details about identity verification for primary contact, beneficial owners, and key representatives"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
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
          <div>
            <label className="block text-sm font-medium text-emerald-300 mb-2">
              Scope 1 Emissions (tCO₂e)
            </label>
            <input
              type="number"
              value={formData.scope1Emissions}
              onChange={(e) => handleInputChange('scope1Emissions', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="0"
            />
            <p className="text-xs text-slate-400 mt-1">Direct emissions from owned sources</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-300 mb-2">
              Scope 2 Emissions (tCO₂e)
            </label>
            <input
              type="number"
              value={formData.scope2Emissions}
              onChange={(e) => handleInputChange('scope2Emissions', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="0"
            />
            <p className="text-xs text-slate-400 mt-1">Indirect emissions from purchased energy</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-300 mb-2">
              Scope 3 Emissions (tCO₂e)
            </label>
            <input
              type="number"
              value={formData.scope3Emissions}
              onChange={(e) => handleInputChange('scope3Emissions', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="0"
            />
            <p className="text-xs text-slate-400 mt-1">All other indirect emissions in value chain</p>
          </div>
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

        <div>
          <div className="flex items-center space-x-3 h-full">
            <input
              type="checkbox"
              checked={formData.emissionsVerified}
              onChange={(e) => handleInputChange('emissionsVerified', e.target.checked)}
              className="w-5 h-5 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
            />
            <label className="text-white font-medium">
              Emissions data independently verified
            </label>
          </div>
        </div>
      </div>

      {formData.emissionsVerified && (
        <div>
          <label className="block text-sm font-medium text-emerald-300 mb-2">
            Verification Statement
          </label>
          <textarea
            value={formData.verificationStatement}
            onChange={(e) => handleInputChange('verificationStatement', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="Details about the third-party verification of your emissions data"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-emerald-300 mb-2">
          Decarbonization Strategy
        </label>
        <textarea
          value={formData.decarbonizationStrategy}
          onChange={(e) => handleInputChange('decarbonizationStrategy', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="Describe your public plan or strategy for reducing emissions"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-emerald-300 mb-2">
          Climate-Related Pledges and Targets
        </label>
        <textarea
          value={formData.climatePledges}
          onChange={(e) => handleInputChange('climatePledges', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="Are you part of any climate initiatives? (e.g., Science Based Targets initiative - SBTi, Net Zero commitments, etc.)"
        />
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
              <p className="text-slate-400 mt-1">Step {currentStep} of 3</p>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>

          {renderStepIndicator()}

          {error && (
            <ErrorMessage message={error} className="mb-6" />
          )}

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
                  ? 'text-slate-500 cursor-not-allowed'
                  : 'text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            {currentStep < 3 ? (
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
                    <span>Registering...</span>
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