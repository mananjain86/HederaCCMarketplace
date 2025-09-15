import React, { useState } from 'react';
import { Search, Filter, Star, TreePine, Factory } from 'lucide-react';
import { CreditCard } from './CreditCard';
import { useRealData, useMarketAnalytics } from '../hooks/useRealData';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

export function Marketplace({ onViewCompany }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { carbonCredits, loading, error } = useRealData();
  const { analytics } = useMarketAnalytics();

  if (loading) {
    return <LoadingSpinner message="Loading real environmental data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const filteredCredits = carbonCredits.filter(credit => {
    const matchesSearch = credit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || credit.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filters */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 mb-8 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search carbon credits, projects, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('carbon')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                filterType === 'carbon'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <Factory className="h-4 w-4" />
              <span>Carbon Credits</span>
            </button>
            <button
              onClick={() => setFilterType('forest')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                filterType === 'forest'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <TreePine className="h-4 w-4" />
              <span>Forest Tokens</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-xl p-4 border border-emerald-500/20">
          <div className="text-2xl font-bold text-white">{analytics.totalCredits.toLocaleString()}</div>
          <div className="text-emerald-300 text-sm">Total Credits Available</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
          <div className="text-2xl font-bold text-white">{analytics.activeProjects}</div>
          <div className="text-blue-300 text-sm">Active Projects</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-white">${(analytics.totalValueLocked / 1000000).toFixed(1)}M</div>
          <div className="text-purple-300 text-sm">Total Value Locked</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-4 border border-orange-500/20">
          <div className="text-2xl font-bold text-white">{analytics.verificationRate}%</div>
          <div className="text-orange-300 text-sm">Verification Rate</div>
        </div>
      </div>

      {/* Credits Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCredits.map((credit) => (
          <CreditCard 
            key={credit.id} 
            credit={credit} 
            onViewCompany={onViewCompany}
          />
        ))}
      </div>

      {filteredCredits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg mb-2">No credits found</div>
          <div className="text-slate-500">Try adjusting your search or filters</div>
        </div>
      )}
    </div>
  );
}