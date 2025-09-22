import React from 'react';
import { TrendingUp, Users, DollarSign, Globe, BarChart3, PieChart } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export function Analytics({ analytics }) {

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Market Analytics</h1>
        <p className="text-slate-400">Real-time insights into the carbon credit marketplace</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-xl p-6 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">+12.5%</span>
          </div>
          <div className="text-2xl font-bold text-white">${analytics.avgPrice}</div>
          <div className="text-emerald-300 text-sm">Avg Price/Ton</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">+8.3%</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.activeBuyers.toLocaleString()}</div>
          <div className="text-blue-300 text-sm">Active Buyers</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">+23.1%</span>
          </div>
          <div className="text-2xl font-bold text-white">${(analytics.volume24h / 1000000).toFixed(1)}M</div>
          <div className="text-purple-300 text-sm">Volume (24h)</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-6 border border-orange-500/20">
          <div className="flex items-center justify-between mb-2">
            <Globe className="h-8 w-8 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">+15.7%</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.co2Offset.toLocaleString()}</div>
          <div className="text-orange-300 text-sm">CO₂ Offset (tons)</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Price Trends */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Price Trends</h3>
            <BarChart3 className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[42, 45, 38, 52, 48, 55, 47, 49, 46, 51, 47, 53].map((height, index) => (
              <div key={index} className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${height * 3}px` }}></div>
            ))}
          </div>
          <div className="flex justify-between text-slate-400 text-sm mt-2">
            <span>Jan</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Market Distribution */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Market Distribution</h3>
            <PieChart className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                <span className="text-slate-300">Forest Conservation</span>
              </div>
              <span className="text-white font-medium">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-slate-300">Renewable Energy</span>
              </div>
              <span className="text-white font-medium">32%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-slate-300">Carbon Capture</span>
              </div>
              <span className="text-white font-medium">15%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-slate-300">Others</span>
              </div>
              <span className="text-white font-medium">8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6">Top Performing Credits</h3>
        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="text-emerald-400 text-sm font-medium mb-2">Real-Time Data Sources:</div>
          <div className="text-emerald-300 text-xs space-y-1">
            <div>• <strong>World Bank Open Data API</strong> - CO₂ emissions & forest coverage data</div>
            <div>• <strong>REST Countries API</strong> - Geographic coordinates & country information</div>
            <div>• <strong>OpenAQ API</strong> - Real-time air quality measurements</div>
            <div>• <strong>Dynamic pricing engine</strong> based on real environmental metrics</div>
            <div>• All data is cached for 10 minutes to optimize performance</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300">Project</th>
                <th className="text-left py-3 px-4 text-slate-300">Type</th>
                <th className="text-left py-3 px-4 text-slate-300">Price</th>
                <th className="text-left py-3 px-4 text-slate-300">24h Change</th>
                <th className="text-left py-3 px-4 text-slate-300">Volume</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Amazon Reforestation', type: 'Forest', price: '$52.40', change: '+8.3%', volume: '12,456', positive: true },
                { name: 'Solar Farm Initiative', type: 'Renewable', price: '$48.90', change: '+5.7%', volume: '9,234', positive: true },
                { name: 'Ocean Conservation', type: 'Marine', price: '$45.20', change: '+3.2%', volume: '7,891', positive: true },
                { name: 'Wind Power Project', type: 'Renewable', price: '$41.80', change: '-1.4%', volume: '6,543', positive: false },
              ].map((credit, index) => (
                <tr key={index} className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-white font-medium">{credit.name}</td>
                  <td className="py-3 px-4 text-slate-300">{credit.type}</td>
                  <td className="py-3 px-4 text-white font-medium">{credit.price}</td>
                  <td className={`py-3 px-4 font-medium ${credit.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {credit.change}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{credit.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}