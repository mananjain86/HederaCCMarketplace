import React from 'react';
import { CheckCircle, TreePine, ArrowRight, Building2 } from 'lucide-react';

export function RegistrationSuccess({ 
  registrationData, 
  onProceedToSeller, 
  onBackToMarketplace 
}) {
  const { message, companyData, showSellerOption, transactionHash } = registrationData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b7e4c7]/40 to-[#d8f3dc]/60 py-8 text-[#1b4332]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#3a5a40]/20 p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="bg-[#b7e4c7]/60 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-[#40916c]" />
            </div>
            <h2 className="text-3xl font-extrabold mb-2">
              Registration Successful!
            </h2>
            <p className="text-[#3a5a40]/70 mb-4">
              {message}
            </p>
            {transactionHash && (
              <div className="bg-[#e8f1ea] rounded-lg p-4 max-w-md mx-auto border border-[#3a5a40]/10">
                <p className="text-sm text-[#3a5a40]/70 mb-1">Transaction Hash:</p>
                <p className="text-[#40916c] font-mono text-sm break-all">{transactionHash}</p>
              </div>
            )}
          </div>

          {/* Company Summary */}
          <div className="bg-[#e8f1ea] rounded-xl p-6 mb-8 border border-[#3a5a40]/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-[#40916c]" />
              Registered Company Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#3a5a40]/70">Company Name:</span>
                <span className="ml-2 font-semibold">{companyData.name}</span>
              </div>
              <div>
                <span className="text-[#3a5a40]/70">Registration Type:</span>
                <span className="ml-2 font-semibold">Basic Company Registration</span>
              </div>
              <div>
                <span className="text-[#3a5a40]/70">Legal Entity:</span>
                <span className="ml-2 font-semibold">{companyData.legalEntityName}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center mb-6">
              What would you like to do next?
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Marketplace Option */}
              <div className="bg-white/60 border border-[#3a5a40]/10 rounded-xl p-6 hover:border-[#40916c]/40 transition-all">
                <div className="text-center">
                  <div className="bg-[#b7e4c7]/60 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-[#40916c]" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">
                    Start Trading
                  </h4>
                  <p className="text-[#3a5a40]/70 mb-4">
                    Browse and purchase carbon credits from verified projects worldwide
                  </p>
                  <button
                    onClick={onBackToMarketplace}
                    className="w-full bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white px-6 py-3 rounded-full font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <span>Go to Marketplace</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Seller Registration Option - Always show as upgrade path */}
              <div className="bg-white/60 border border-[#3a5a40]/10 rounded-xl p-6 hover:border-[#40916c]/40 transition-all">
                <div className="text-center">
                  <div className="bg-[#b7e4c7]/60 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TreePine className="h-8 w-8 text-[#40916c]" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">
                    Become a Carbon Credit Seller
                  </h4>
                  <p className="text-[#3a5a40]/70 mb-4">
                    Upgrade to sell carbon credits by registering your projects with comprehensive documentation
                  </p>
                  <button
                    onClick={onProceedToSeller}
                    className="w-full border-2 border-[#40916c] text-[#40916c] px-6 py-3 rounded-full font-bold hover:bg-[#b7e4c7]/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Upgrade to Seller</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Info for Seller Upgrade */}
            <div className="bg-blue-100/60 border border-blue-400/30 rounded-xl p-4 mt-6">
              <div className="flex items-start space-x-3">
                <TreePine className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-blue-800 font-bold mb-2">Why Become a Carbon Credit Seller?</h4>
                  <p className="text-blue-900/80 text-sm leading-relaxed">
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
                className="text-[#3a5a40]/60 hover:text-[#1b4332] transition-colors underline font-semibold"
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