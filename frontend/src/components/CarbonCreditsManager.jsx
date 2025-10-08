import React, { useState } from 'react';
import { ethers } from 'ethers';
import COMPANY_ABI from "../abi/HandleCompany.json"
import CARBON_ABI from "../abi/CarbonCreditMarketplace.json"

const CarbonCreditsManager = () => {
  const [companyAddress, setCompanyAddress] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const CARBON_ADDRESS = import.meta.env.VITE_CARBON_CONTRACT_ADDRESS;
  const handleAddCredits = async (e) => {
    e.preventDefault();
    
    if (!validateAddress(companyAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }
    
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      alert('Please enter a valid credit amount');
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CARBON_ADDRESS, CARBON_ABI, signer);
      
      // Convert amount to appropriate format - using ethers v6 syntax
      const amount = ethers.parseUnits(creditAmount, 0); // For whole numbers
      
      const tx = await contract.addCarbonCreditsToAccount(companyAddress, amount);
      await tx.wait();
      
      alert(`Successfully added ${creditAmount} carbon credits to ${companyAddress}`);
      
      // Reset form
      setCompanyAddress('');
      setCreditAmount('');
    } catch (error) {
      console.error('Error adding carbon credits:', error);
      
      // Handle specific error messages
      if (error.message.includes('Company not registered')) {
        alert('Error: Company is not registered');
      } else if (error.message.includes('Only owner')) {
        alert('Error: Only contract owner can add carbon credits');
      } else {
        alert('Error adding carbon credits: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const validateAddress = (address) => {
    // Check if address is a valid Ethereum address
    try {
      // Use ethers v6 syntax for address validation
      if (ethers.isAddress) {
        return ethers.isAddress(address);
      }
      // Fallback for ethers v5
      if (ethers.utils && ethers.utils.isAddress) {
        return ethers.utils.isAddress(address);
      }
      // Manual validation as last resort
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    } catch (error) {
      console.error('Address validation error:', error);
      return false;
    }
  };

  return (
    <div className="p-6 rounded-lg ">
      <h3 className="text-xl font-bold text-white mb-6">Add Carbon Credits to Company</h3>
      
      <form onSubmit={handleAddCredits} className="max-w-md space-y-6">
        <div>
          <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Company Address:
          </label>
          <input
            type="text"
            id="companyAddress"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder="0x..."
            required
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              companyAddress && !validateAddress(companyAddress) 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {companyAddress && !validateAddress(companyAddress) && (
            <p className="mt-1 text-sm text-red-600">Invalid Ethereum address</p>
          )}
        </div>
        
        <div>
          <label htmlFor="creditAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Credit Amount:
          </label>
          <input
            type="number"
            id="creditAmount"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !validateAddress(companyAddress) || !creditAmount}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding Credits...
            </div>
          ) : (
            'Add Carbon Credits'
          )}
        </button>
      </form>
    </div>
  );
};

export { CarbonCreditsManager };