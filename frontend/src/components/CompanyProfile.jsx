import React from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Shield, 
  Star, 
  TrendingUp, 
  ExternalLink,
  TreePine,
  Factory
} from 'lucide-react';
import { PricingEngine } from './PricingEngine';
import { LoadingSpinner } from './LoadingSpinner';

export function CompanyProfile({ 
  company, 
  creditData, 
  onBack, 
  showProjectDetails = false,
  onBuyCredits 
}) {
  // If showing project details, render project information
  if (showProjectDetails && creditData) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-slate-900 to-emerald-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-emerald-500/20 p-8">
            
            {/* Project Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                {creditData.type === 'carbon' ? 
                  <Factory className="h-8 w-8 text-emerald-400" /> : 
                  <TreePine className="h-8 w-8 text-emerald-400" />
                }
                <div>
                  <h1 className="text-3xl font-bold text-white">{creditData.projectName}</h1>
                  <div className="flex items-center text-slate-400 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{creditData.location}</span>
                  </div>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {creditData.verified && (
                  <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Verified</span>
                  </div>
                )}
                {creditData.parisCompliant && (
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Paris Agreement Compliant
                  </div>
                )}
                {creditData.hostCountryAuth && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Host Country Authorization
                  </div>
                )}
              </div>
            </div>

            {/* Project Image */}
            <div className="mb-8">
              <img 
                src={creditData.image} 
                alt={creditData.projectName}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1497436072909-f5e4be8af9c6?w=800&h=400&fit=crop';
                }}
              />
            </div>

            {/* Project Details Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              
              {/* Left Column - Project Info */}
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Project Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Project ID:</span>
                      <span className="text-white">{creditData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vintage Year:</span>
                      <span className="text-white">{creditData.creditVintageYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Registry:</span>
                      <span className="text-white">{creditData.accreditedRegistry}</span>
                    </div>
                    {creditData.creditSerialNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Serial Number:</span>
                        <span className="text-white font-mono text-sm">{creditData.creditSerialNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">CO₂ Reduction:</span>
                      <span className="text-white font-semibold">{creditData.co2Reduction.toLocaleString()} tons</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Location & Impact</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Country:</span>
                      <span className="text-white">{creditData.projectCountry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Region:</span>
                      <span className="text-white">{creditData.projectRegion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Rating:</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-white">{creditData.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Purchase Info */}
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Purchase Information</h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{creditData.price}</div>
                      <div className="text-slate-400">per ton CO₂</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Available Credits:</span>
                        <span className="text-white font-semibold">{creditData.availableCredits.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${creditData.totalCredits > 0 ? (creditData.availableCredits / creditData.totalCredits) * 100 : 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Update the purchase button */}
                    <button 
                      onClick={() => {
                        if (onBuyCredits) {
                          onBuyCredits(creditData);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Purchase Credits</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Seller Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Seller Address:</span>
                      <span className="text-white font-mono text-sm">{creditData.seller.slice(0, 6)}...{creditData.seller.slice(-4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Project Description</h3>
              <p className="text-slate-300 leading-relaxed">
                {creditData.projectDescription || `This ${creditData.type} credit project is located in ${creditData.location} and represents ${creditData.co2Reduction.toLocaleString()} tons of CO₂ equivalent emissions reductions. The project has been verified through ${creditData.accreditedRegistry} and meets international standards for carbon offset quality.`}
              </p>
            </div>

            {/* Registry Link */}
            {creditData.registryUrl && creditData.registryUrl !== '' && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4">External Links</h3>
                <a 
                  href={creditData.registryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View on Registry</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Marketplace</span>
      </button>

      {/* Company Header */}
      <div className="bg-gradient-to-r from-slate-800/70 to-slate-700/70 backdrop-blur-md rounded-xl p-8 mb-8 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <img 
            src={company.logo} 
            alt={`${company.name} logo`}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{company.name}</h1>
              {company.verified ? (
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-400" />
              )}
            </div>
            <div className="flex items-center text-slate-400 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{company.location}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-slate-300">
                <Award className="h-4 w-4 text-yellow-400 mr-1" />
                <span>ESG Score: {company.esgScore}/100</span>
              </div>
              <div className="flex items-center text-slate-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Since {company.foundedYear}</span>
              </div>
              <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                {company.realDataSource}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white mb-1">{company.industry}</div>
            <div className="text-slate-400">Industry</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Carbon Footprint</h3>
            <TrendingDown className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{company.carbonFootprint.toLocaleString()}</div>
          <div className="text-slate-400 text-sm mb-3">tons CO₂/year</div>
          <div className="text-red-300 text-sm">
            {company.footprintChange > 0 ? '+' : ''}{company.footprintChange}% vs last year
          </div>
        </div>

        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Deforestation Impact</h3>
            <TrendingUp className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{company.deforestationRate}</div>
          <div className="text-slate-400 text-sm mb-3">hectares/year</div>
          <div className="text-red-300 text-sm">High impact industry</div>
        </div>

        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Credits Purchased</h3>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{company.totalCreditsPurchased.toLocaleString()}</div>
          <div className="text-slate-400 text-sm mb-3">tons CO₂</div>
          <div className="text-emerald-300 text-sm">
            ${(company.totalCreditsPurchased * 45).toLocaleString()} invested
          </div>
        </div>
      </div>

      {/* Pricing Engine */}
      <PricingEngine company={company} />

      {/* Purchase History */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 mb-8">
        <h3 className="text-xl font-semibold text-white mb-6">Purchase History</h3>
        <div className="space-y-4">
          {company.purchaseHistory.map((purchase, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <div className="text-white font-medium">{purchase.project}</div>
                <div className="text-slate-400 text-sm">{purchase.date}</div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{purchase.credits} credits</div>
                <div className="text-slate-400 text-sm">${purchase.price}/ton</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environmental Commitments */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6">Environmental Commitments</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-emerald-400 mb-3">Net Zero Targets</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Target Year:</span>
                <span className="text-white">{company.netZeroTarget}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Progress:</span>
                <span className="text-emerald-400">23% achieved</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-medium text-emerald-400 mb-3">Renewable Energy</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Current Usage:</span>
                <span className="text-white">{company.renewableEnergyUsage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Target by 2030:</span>
                <span className="text-emerald-400">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}