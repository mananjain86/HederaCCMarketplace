import React from 'react';
import { Star, MapPin, Calendar, TrendingUp, Shield, TreePine, Factory } from 'lucide-react';

export function CreditCard({ credit, onViewCompany }) {
  
  // Map blockchain data to UI properties with fallbacks
  const mappedCredit = {
    id: credit.id || '0',
    title: credit.projectName || `Project ${credit.id}`,
    location: `${credit.projectRegion || 'Unknown'}, ${credit.projectCountry || 'Unknown'}`,
    co2Reduction: credit.amount || 0, // Using amount as CO2 reduction
    realDataSource: credit.accreditedRegistry || 'Unknown Registry',
    rating: '4.8', // Default rating since not in blockchain data
    vintage: credit.creditVintageYear || new Date().getFullYear(),
    availableCredits: credit.amount || 0,
    totalCredits: credit.amount || 0, // Assuming all credits are available
    price: credit.price || `${credit.pricePerCredit || 0} ETH`,
    priceChange: 0, // Default since not tracked in blockchain
    type: credit.type || 'carbon',
    verified: credit.isVerified || false,
    image: getDefaultImage(credit.type),
    companyId: credit.seller || '',
    seller: credit.seller || '',
    registryUrl: credit.registryUrl || '',
    serialNumber: credit.creditSerialNumber || '',
    parisCompliant: credit.parisAgreementCompliant || false,
    hostCountryAuth: credit.hostCountryAuthorization || false
  };

  function getDefaultImage(type) {
    return type === 'forest' 
      ? 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
      : 'https://images.unsplash.com/photo-1497436072909-f5e4be8af9c6?w=400&h=300&fit=crop';
  }

  const getPriceColor = (change) => {
    if (change > 0) return 'text-emerald-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-300';
  };

  return (
    <div className="bg-slate-800/70 backdrop-blur-md rounded-xl overflow-hidden border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
      <div className="relative">
        <img 
          src={mappedCredit.image} 
          alt={mappedCredit.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1497436072909-f5e4be8af9c6?w=400&h=300&fit=crop';
          }}
        />
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
            mappedCredit.type === 'carbon' 
              ? 'bg-slate-900/80 text-slate-200' 
              : 'bg-emerald-900/80 text-emerald-200'
          }`}>
            {mappedCredit.type === 'carbon' ? <Factory className="h-3 w-3" /> : <TreePine className="h-3 w-3" />}
            <span>{mappedCredit.type === 'carbon' ? 'Carbon Credit' : 'Forest Token'}</span>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          {mappedCredit.verified && (
            <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Verified</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{mappedCredit.title}</h3>
        
        <div className="flex items-center text-slate-400 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{mappedCredit.location} • {mappedCredit.co2Reduction.toLocaleString()} tons CO₂</span>
        </div>
        
        <div className="mb-3">
          <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">
            📊 {mappedCredit.realDataSource}
          </div>
        </div>

        {/* Additional blockchain-specific info */}
        <div className="mb-3 space-y-1">
          {mappedCredit.serialNumber && (
            <div className="text-xs text-slate-400">
              Serial: {mappedCredit.serialNumber}
            </div>
          )}
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            {mappedCredit.parisCompliant && (
              <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                Paris Agreement
              </span>
            )}
            {mappedCredit.hostCountryAuth && (
              <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded">
                Host Country Auth
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center text-slate-300">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm">{mappedCredit.rating}</span>
          </div>
          <div className="flex items-center text-slate-400 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{mappedCredit.vintage}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Available Credits</span>
            <span className="text-white font-medium">{mappedCredit.availableCredits.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${mappedCredit.totalCredits > 0 ? (mappedCredit.availableCredits / mappedCredit.totalCredits) * 100 : 100}%` 
              }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-white">{mappedCredit.price}</div>
            <div className="text-slate-400 text-sm">per ton CO₂</div>
          </div>
          <div className={`flex items-center space-x-1 ${getPriceColor(mappedCredit.priceChange)}`}>
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              {mappedCredit.priceChange > 0 ? '+' : ''}{mappedCredit.priceChange}%
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={() => onViewCompany && onViewCompany(mappedCredit.seller)}
            className="flex-1 bg-slate-700/50 text-slate-300 py-2 px-4 rounded-lg font-medium hover:bg-slate-600/50 transition-all"
          >
            View Details
          </button>
          <button 
            onClick={() => {
              // TODO: Implement buy functionality
              console.log('Buy credits for listing:', mappedCredit.id);
            }}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            Buy Credits
          </button>
        </div>

        {/* Registry link if available */}
        {mappedCredit.registryUrl && mappedCredit.registryUrl !== '' && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <a 
              href={mappedCredit.registryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View on Registry →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}