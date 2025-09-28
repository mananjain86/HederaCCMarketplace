import React from 'react';
import { TrendingUp, Shield, Globe } from 'lucide-react';

export function Hero({ analytics }) {

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-emerald-900 py-16">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Trade Carbon Credits &
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              {' '}Forest Tokens
            </span>
          </h1>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            The world's first blockchain-powered marketplace for carbon credits and forest conservation tokens.
            Real-time data from World Bank, Global Forest Watch, and environmental APIs.
          </p>
          <div className="bg-slate-900/50 backdrop-blur-md rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{analytics.totalCredits.toLocaleString()}</div>
                <div className="text-emerald-200 text-sm">Live Credits</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-400">${analytics.avgPrice}</div>
                <div className="text-teal-200 text-sm">Avg Price/Ton</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">{analytics.co2Offset.toLocaleString()}</div>
                <div className="text-cyan-200 text-sm">CO₂ Offset</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all">
              Buy Credits
            </button>
            <button className="border border-emerald-400 text-emerald-400 px-8 py-3 rounded-lg font-medium hover:bg-emerald-400/10 transition-all">
              Learn More
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Verified Credits</h3>
            <p className="text-emerald-100">All carbon credits are verified and audited by certified organizations</p>
          </div>
          <div className="text-center">
            <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Global Impact</h3>
            <p className="text-emerald-100">Supporting reforestation and carbon reduction projects worldwide</p>
          </div>
          <div className="text-center">
            <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Dynamic Pricing</h3>
            <p className="text-emerald-100">AI-powered pricing based on real environmental data</p>
          </div>
        </div>
      </div>
    </div>
  );
}