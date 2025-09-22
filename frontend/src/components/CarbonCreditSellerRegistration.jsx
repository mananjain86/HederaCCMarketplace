import React, { useState } from 'react';
import { 
  TreePine, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  MapPin, 
  Users,
  AlertCircle,
  Globe,
  Shield,
  Award,
  Target,
  Handshake,
  Scale,
  Link,
  Calendar,
  Hash,
  Zap
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

export function CarbonCreditSellerRegistration({ onBack, onRegistrationComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    // Project Information
    projectName: '',
    projectId: '',
    projectType: '',
    projectCountry: '',
    projectRegion: '',
    projectCoordinates: '',
    registryUrl: '',
    
    // Project Documentation & Integrity
    accreditedRegistry: '',
    registryStandard: '',
    hostCountryAuthorization: false,
    authorizationLetter: '',
    parisAgreementCompliant: false,
    projectDocumentation: '',
    
    // Credit & Co-Benefit Details
    creditVintage: '',
    serialNumbers: ''
  });

  const steps = [
    {
      id: 1,
      title: 'Project Information',
      icon: TreePine,
      description: 'Basic project details and location'
    },
    {
      id: 2,
      title: 'Documentation & Credits',
      icon: Award,
      description: 'Project integrity and verification'
    }
  ];

  const projectTypes = [
    'Reforestation',
    'Afforestation',
    'Forest Conservation',
    'Improved Cookstoves',
    'Clean Water Access',
    'Renewable Energy - Solar',
    'Renewable Energy - Wind',
    'Renewable Energy - Hydro',
    'Renewable Energy - Biomass',
    'Waste Management',
    'Methane Capture',
    'Agricultural Practices - Climate-Smart',
    'Wetland Restoration',
    'Mangrove Conservation',
    'Savanna Restoration',
    'Agroforestry',
    'Sustainable Land Management',
    'Community-Based Natural Resource Management',
    'Other'
  ];

  const registryOptions = [
    'Verra (VCS)',
    'Gold Standard',
    'Climate Action Reserve (CAR)',
    'American Carbon Registry (ACR)',
    'Plan Vivo',
    'Other'
  ];

  const sdgOptions = [
    'SDG 1: No Poverty',
    'SDG 2: Zero Hunger',
    'SDG 3: Good Health and Well-being',
    'SDG 4: Quality Education',
    'SDG 5: Gender Equality',
    'SDG 6: Clean Water and Sanitation',
    'SDG 7: Affordable and Clean Energy',
    'SDG 8: Decent Work and Economic Growth',
    'SDG 13: Climate Action',
    'SDG 15: Life on Land'
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

  const handleSDGChange = (sdg) => {
    const updatedSDGs = formData.sdgContributions.includes(sdg)
      ? formData.sdgContributions.filter(s => s !== sdg)
      : [...formData.sdgContributions, sdg];
    
    handleInputChange('sdgContributions', updatedSDGs);
  };

  const validateStep = (step) => {
    const errors = {};
    
    switch(step) {
      case 1:
        if (!formData.projectName) errors.projectName = 'Project name is required';
        if (!formData.projectType) errors.projectType = 'Project type is required';
        if (!formData.projectCountry) errors.projectCountry = 'Project country is required';
        if (!formData.registryUrl) errors.registryUrl = 'Registry URL is required';
        break;
      case 2:
        if (!formData.accreditedRegistry) errors.accreditedRegistry = 'Accredited registry is required';
        if (!formData.creditVintage) errors.creditVintage = 'Credit vintage is required';
        if (!formData.serialNumbers) errors.serialNumbers = 'Serial numbers are required';
        break;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const nextStep = () => {
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError('Please correct the errors below before continuing.');
      return;
    }
    if (currentStep < 2) {
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
    const validation = validateStep(2);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError('Please correct all errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Carbon Credit Seller Registration:', formData);
      onRegistrationComplete();
    } catch (err) {
      setError('Registration failed. Please try again.');
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

  const renderTextareaWithError = (field, label, placeholder = '', required = false, rows = 3) => (
    <div>
      <label className="block text-sm font-medium text-emerald-300 mb-2">
        {label} {required && '*'}
      </label>
      <textarea
        value={formData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        rows={rows}
        className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors ${
          fieldErrors[field] 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-slate-600 focus:border-emerald-500 focus:ring-emerald-500'
        }`}
        placeholder={placeholder}
      />
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
        <p className="text-slate-400">Basic project details and registry information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError('projectName', 'Project Name', 'text', 'Congo Basin Forest Conservation Project', true, TreePine)}
        {renderInputWithError('projectId', 'Project ID', 'text', 'VCS-123456', false, Hash)}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-emerald-300 mb-2">
            Project Type *
          </label>
          <select
            value={formData.projectType}
            onChange={(e) => handleInputChange('projectType', e.target.value)}
            className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:ring-1 transition-colors ${
              fieldErrors.projectType 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-slate-600 focus:border-emerald-500 focus:ring-emerald-500'
            }`}
          >
            <option value="">Select project type</option>
            {projectTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {fieldErrors.projectType && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {fieldErrors.projectType}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-emerald-300 mb-2">
            Project Country *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={formData.projectCountry || ''}
              onChange={(e) => handleInputChange('projectCountry', e.target.value)}
              className={`w-full pl-11 pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors ${
                fieldErrors.projectCountry 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-600 focus:border-emerald-500 focus:ring-emerald-500'
              }`}
              placeholder="e.g., Kenya, Ghana, Tanzania, Rwanda, Ethiopia, etc."
              list="african-countries"
            />
            <datalist id="african-countries">
              <option value="Algeria" />
              <option value="Angola" />
              <option value="Botswana" />
              <option value="Cameroon" />
              <option value="Democratic Republic of Congo" />
              <option value="Egypt" />
              <option value="Ethiopia" />
              <option value="Ghana" />
              <option value="Kenya" />
              <option value="Madagascar" />
              <option value="Morocco" />
              <option value="Nigeria" />
              <option value="Rwanda" />
              <option value="Senegal" />
              <option value="South Africa" />
              <option value="Tanzania" />
              <option value="Uganda" />
              <option value="Zambia" />
              <option value="Zimbabwe" />
            </datalist>
          </div>
          {fieldErrors.projectCountry && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {fieldErrors.projectCountry}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputWithError('projectRegion', 'Project Region/Province', 'text', 'Équateur Province', false)}
        {renderInputWithError('projectCoordinates', 'GPS Coordinates', 'text', 'Lat: -0.2284, Lon: 15.8277', false)}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Link className="h-5 w-5 text-emerald-400 mr-2" />
          Registry Information
        </h4>
        {renderInputWithError('registryUrl', 'Link to Project on Registry', 'url', 'https://registry.verra.org/app/projectDetail/VCS1234', true, Globe)}
        <p className="text-sm text-slate-400 mt-2">
          Provide a direct URL to your project's page on the accredited registry (Verra, Gold Standard, etc.)
        </p>
      </div>
    </div>
  );



  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Documentation & Credit Details</h3>
        <p className="text-slate-400">Project documentation and basic credit information</p>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield className="h-5 w-5 text-emerald-400 mr-2" />
          Project Documentation & Integrity
        </h4>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-emerald-300 mb-2">
              Accredited Registry *
            </label>
            <select
              value={formData.accreditedRegistry}
              onChange={(e) => handleInputChange('accreditedRegistry', e.target.value)}
              className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:ring-1 transition-colors ${
                fieldErrors.accreditedRegistry 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-600 focus:border-emerald-500 focus:ring-emerald-500'
              }`}
            >
              <option value="">Select registry</option>
              {registryOptions.map(registry => (
                <option key={registry} value={registry}>{registry}</option>
              ))}
            </select>
            {fieldErrors.accreditedRegistry && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {fieldErrors.accreditedRegistry}
              </p>
            )}
          </div>

          {renderInputWithError('registryStandard', 'Registry Standard', 'text', 'VCS Version 4.0', false)}
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Award className="h-5 w-5 text-emerald-400 mr-2" />
          Credit Details
        </h4>

        <div className="grid md:grid-cols-2 gap-6">
          {renderInputWithError('creditVintage', 'Credit Vintage Year', 'number', '2024', true, Calendar)}
          
          {renderTextareaWithError(
            'serialNumbers', 
            'Vintage & Serial Numbers', 
            'Provide the vintage years and serial numbers of credits to prevent double selling (e.g., VCS-1234-2024-1 to VCS-1234-2024-10000)...', 
            true,
            3
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Carbon Credit Seller Registration
              </h2>
              <p className="text-slate-400">
                For Companies Selling/Listing Carbon Credits (Project Developers)
              </p>
            </div>

            {renderStepIndicator()}

            {error && <ErrorMessage message={error} />}

            <div className="bg-slate-900/50 rounded-lg p-6 mb-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep3()}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-emerald-300 hover:bg-emerald-500/20 px-6 py-3 rounded-lg font-medium transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back to Selection</span>
              </button>

              <div className="flex space-x-4">
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
      </div>
    </div>
  );
}