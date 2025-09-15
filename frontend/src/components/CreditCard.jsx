import React from 'react';
import { Star, MapPin, Calendar, TrendingUp, Shield, TreePine, Factory } from 'lucide-react';

export function CreditCard({ credit, onViewCompany }) {
  const getPriceColor = (change) => {
    if (change > 0) return 'text-emerald-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-300';
  };

  return (
    <div className="bg-slate-800/70 backdrop-blur-md rounded-xl overflow-hidden border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
      <div className="relative">
        <img 
          src={credit.image} 
          alt={credit.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
            credit.type === 'carbon' 
              ? 'bg-slate-900/80 text-slate-200' 
              : 'bg-emerald-900/80 text-emerald-200'
          }`}>
            {credit.type === 'carbon' ? <Factory className="h-3 w-3" /> : <TreePine className="h-3 w-3" />}
            <span>{credit.type === 'carbon' ? 'Carbon Credit' : 'Forest Token'}</span>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          {credit.verified && (
            <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Verified</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{credit.title}</h3>
        
        <div className="flex items-center text-slate-400 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{credit.location} • {credit.co2Reduction.toLocaleString()} tons CO₂ reduction</span>
        </div>
        
        <div className="mb-3">
          <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">
            📊 {credit.realDataSource}
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center text-slate-300">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm">{credit.rating}</span>
          </div>
          <div className="flex items-center text-slate-400 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{credit.vintage}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Available Credits</span>
            <span className="text-white font-medium">{credit.availableCredits.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(credit.availableCredits / credit.totalCredits) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-white">${credit.price}</div>
            <div className="text-slate-400 text-sm">per ton CO₂</div>
          </div>
          <div className={`flex items-center space-x-1 ${getPriceColor(credit.priceChange)}`}>
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              {credit.priceChange > 0 ? '+' : ''}{credit.priceChange}%
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={() => onViewCompany(credit.companyId)}
            className="flex-1 bg-slate-700/50 text-slate-300 py-2 px-4 rounded-lg font-medium hover:bg-slate-600/50 transition-all"
          >
            View Details
          </button>
          <button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all">
            Buy Credits
          </button>
        </div>
      </div>
    </div>
  );
}