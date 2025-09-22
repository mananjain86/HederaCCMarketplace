import React from 'react';
import { CheckCircle, TreePine, ArrowRight, Building2 } from 'lucide-react';

export function RegistrationSuccess({ 
  registrationData, 
  onProceedToSeller, 
  onBackToMarketplace 
}) {
  const { message, companyData, showSellerOption, transactionHash } = registrationData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 p-8">
          
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="bg-emerald-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Registration Successful!
            </h2>
            <p className="text-slate-400 mb-4">
              {message}
            </p>
            {transactionHash && (
              <div className="bg-slate-900/50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-slate-300 mb-1">Transaction Hash:</p>
                <p className="text-emerald-400 font-mono text-sm break-all">{transactionHash}</p>
              </div>
            )}
          </div>

          {/* Company Summary */}
          <div className="bg-slate-900/50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Building2 className="h-6 w-6 text-emerald-400 mr-2" />
              Registered Company Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Company Name:</span>
                <span className="text-white ml-2 font-medium">{companyData.name}</span>
              </div>
              <div>
                <span className="text-slate-400">Registration Type:</span>
                <span className="text-white ml-2 font-medium">Basic Company Registration</span>
              </div>
              <div>
                <span className="text-slate-400">Legal Entity:</span>
                <span className="text-white ml-2 font-medium">{companyData.legalEntityName}</span>
              </div>
              <div>
                <span className="text-slate-400">Jurisdiction:</span>
                <span className="text-white ml-2 font-medium">{companyData.jurisdiction}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white text-center mb-6">
              What would you like to do next?
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Marketplace Option */}
              <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-6 hover:border-emerald-500/50 transition-all">
                <div className="text-center">
                  <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Start Trading
                  </h4>
                  <p className="text-slate-400 mb-4">
                    Browse and purchase carbon credits from verified projects worldwide
                  </p>
                  <button
                    onClick={onBackToMarketplace}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Go to Marketplace</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Seller Registration Option - Always show as upgrade path */}
              <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-6 hover:border-emerald-500/50 transition-all">
                <div className="text-center">
                  <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TreePine className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Become a Carbon Credit Seller
                  </h4>
                  <p className="text-slate-400 mb-4">
                    Upgrade to sell carbon credits by registering your projects with comprehensive documentation
                  </p>
                  <button
                    onClick={onProceedToSeller}
                    className="w-full border border-emerald-400 text-emerald-400 px-6 py-3 rounded-lg font-medium hover:bg-emerald-400/10 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Upgrade to Seller</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Info for Seller Upgrade */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-6">
              <div className="flex items-start space-x-3">
                <TreePine className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-blue-300 font-semibold mb-2">Why Become a Carbon Credit Seller?</h4>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Our specialized seller registration process ensures your projects meet international standards 
                    while addressing African context requirements including land tenure, community engagement, 
                    and benefit sharing agreements. Upgrade to unlock the ability to list and sell your carbon credits 
                    on our marketplace.
                  </p>
                </div>
              </div>
            </div>

            {/* Skip Option */}
            <div className="text-center">
              <button
                onClick={onBackToMarketplace}
                className="text-slate-400 hover:text-white transition-colors underline"
              >
                Skip seller upgrade and go to marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}