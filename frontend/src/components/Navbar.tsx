import React from 'react';
import { Leaf, BarChart3, Building2, Wallet } from 'lucide-react';

export function Navbar({ currentView, onViewChange }) {
  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-emerald-400" />
            <span className="text-2xl font-bold text-white">CarbonChain</span>
            <span className="text-sm text-emerald-400 font-medium">Marketplace</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onViewChange('marketplace')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'marketplace'
                  ? 'bg-emerald-500 text-white'
                  : 'text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Marketplace</span>
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'analytics'
                  ? 'bg-emerald-500 text-white'
                  : 'text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}