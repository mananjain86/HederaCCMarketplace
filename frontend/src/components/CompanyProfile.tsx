import React from 'react';
import { ArrowLeft, MapPin, Calendar, TrendingDown, TrendingUp, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { useRealData } from '../hooks/useRealData';
import { PricingEngine } from './PricingEngine';
import { LoadingSpinner } from './LoadingSpinner';

export function CompanyProfile({ companyId, onBack }) {
  const { companies, loading } = useRealData();
  const company = companies.find(c => c.id === companyId);
  
  if (loading) {
    return <LoadingSpinner message="Loading company data..." />;
  }

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-400 text-lg">Company not found</div>
          <button onClick={onBack} className="mt-4 text-emerald-400 hover:text-emerald-300">
            Go back to marketplace
          </button>
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