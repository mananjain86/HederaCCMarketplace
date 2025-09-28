import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom";

export function PricingEngine({ company }) {
  const [creditAmount, setCreditAmount] = useState(1000);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [govFee, setGovFee] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const navigate = useNavigate();
  console.log('PricingEngine Company Data:', company);

  useEffect(() => {
    // Dynamic pricing algorithm based on company's environmental data
    const basePricePerTon = 45;
    
    // Risk multiplier based on carbon footprint (higher footprint = higher price)
    const footprintMultiplier = Math.min(1 + (company.carbonFootprint / 100000), 2.5);
    
    // Deforestation penalty (higher rate = higher price)
    const deforestationPenalty = Math.min(1 + (company.deforestationRate / 1000), 1.8);
    
    // ESG score discount (higher score = lower price)
    const esgDiscount = Math.max(0.7, 1 - (company.esgScore / 200));
    
    // Industry risk factor
    const industryRisk = company.industry === 'Manufacturing' ? 1.3 : 
                        company.industry === 'Energy' ? 1.5 : 1.1;
    
    const adjustedPrice = basePricePerTon * footprintMultiplier * deforestationPenalty * esgDiscount * industryRisk;
    const totalPrice = adjustedPrice * creditAmount;
    const governmentFee = totalPrice * 0.075; // 7.5% government fee
    const finalTotal = totalPrice + governmentFee;
    
    setCalculatedPrice(adjustedPrice);
    setGovFee(governmentFee);
    setTotalCost(finalTotal);
  }, [creditAmount, company]);

  const getRiskLevel = () => {
    const riskScore = (company.carbonFootprint / 10000) + (company.deforestationRate / 100) - (company.esgScore / 10);
    if (riskScore > 20) return { level: 'High', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (riskScore > 10) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  };

  const risk = getRiskLevel();

  return (
    <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <Calculator className="h-6 w-6 text-emerald-400" />
        <h3 className="text-xl font-semibold text-white">Dynamic Pricing Engine</h3>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pricing Factors */}
        <div>
          <h4 className="text-lg font-medium text-emerald-400 mb-4">Pricing Factors</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Base Price</span>
              <span className="text-white font-medium">$45.00/ton</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Carbon Footprint Impact</span>
              <span className="text-red-300 font-medium">+{(((company.carbonFootprint / 100000) * 100)).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Deforestation Penalty</span>
              <span className="text-red-300 font-medium">+{((company.deforestationRate / 1000) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">ESG Score Discount</span>
              <span className="text-emerald-400 font-medium">-{((company.esgScore / 200) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Industry Risk Factor</span>
              <span className="text-orange-300 font-medium">+30%</span>
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-lg ${risk.bg} border border-current/20`}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`h-4 w-4 ${risk.color}`} />
              <span className={`font-medium ${risk.color}`}>Risk Level: {risk.level}</span>
            </div>
            <div className="text-xs mt-1 opacity-75">
              Based on real emissions data: {company.realDataSource}
            </div>
          </div>
        </div>

        {/* Price Calculator */}
        <div>
          <h4 className="text-lg font-medium text-emerald-400 mb-4">Price Calculator</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Credits Required (tons CO₂)
              </label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                min="1"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Adjusted Price per Ton:</span>
                <span className="text-white font-medium">${calculatedPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Subtotal ({creditAmount.toLocaleString()} tons):</span>
                <span className="text-white font-medium">${(calculatedPrice * creditAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Government Fee (7.5%):</span>
                <span className="text-orange-300 font-medium">${govFee.toLocaleString()}</span>
              </div>
              <hr className="border-slate-600" />
              <div className="flex justify-between text-lg">
                <span className="text-emerald-400 font-semibold">Total Cost:</span>
                <span className="text-emerald-400 font-bold">${totalCost.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={() => navigate(`/buy`)} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Initiate Purchase</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}