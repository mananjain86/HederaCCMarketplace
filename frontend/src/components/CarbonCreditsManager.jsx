import React, { useState } from 'react';
import { ethers } from 'ethers';
import COMPANY_ABI from "../abi/HandleCompany.json";
import CARBON_ABI from "../abi/CarbonCreditMarketplace.json";

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

            const amount = ethers.parseUnits(creditAmount, 0);

            const tx = await contract.addCarbonCreditsToAccount(companyAddress, amount);
            await tx.wait();

            alert(`Successfully added ${creditAmount} carbon credits to ${companyAddress}`);

            setCompanyAddress('');
            setCreditAmount('');
        } catch (error) {
            console.error('Error adding carbon credits:', error);

            if (error.message.includes('Company not registered')) {
                alert('Company is not registered');
            } else if (error.message.includes('Only owner')) {
                alert('Only contract Owner can add Carbon Credits');
            } else {
                alert('Error adding carbon credits: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const validateAddress = (address) => {
        try {
            if (ethers.isAddress) {
                return ethers.isAddress(address);
            }
            if (ethers.utils && ethers.utils.isAddress) {
                return ethers.utils.isAddress(address);
            }
            return /^0x[a-fA-F0-9]{40}$/.test(address);
        } catch (error) {
            console.error('Address validation error:', error);
            return false;
        }
    };

    return (
        <div className="p-10 rounded-xl bg-slate-800/70 backdrop-blur-sm shadow-xl border border-yellow-700 max-w-2xl mx-auto mt-10"> {/* Increased padding and max-width */}
            <h3 className="text-3xl font-bold text-yellow-300 mb-10 text-center"> {/* Increased text size and margin */}
                Approve Carbon Credits
            </h3>

            <form onSubmit={handleAddCredits} className="space-y-8"> {/* Increased spacing */}
                <div>
                    <label htmlFor="companyAddress" className="block text-base font-medium text-yellow-100 mb-2"> {/* Increased text size */}
                        Company Address:
                    </label>
                    <input
                        type="text"
                        id="companyAddress"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="0x..."
                        required
                        className={`w-full px-4 py-3 border rounded-md shadow-sm bg-slate-700 text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${ // Increased padding and text size
                            companyAddress && !validateAddress(companyAddress)
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-slate-600 focus:border-yellow-500'
                        }`}
                    />
                    {companyAddress && !validateAddress(companyAddress) && (
                        <p className="mt-2 text-sm text-red-400">Invalid Ethereum address</p>
                    )}
                </div>

                <div>
                    <label htmlFor="creditAmount" className="block text-base font-medium text-yellow-100 mb-2"> {/* Increased text size */}
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
                        className="w-full px-4 py-3 border border-slate-600 rounded-md shadow-sm bg-slate-700 text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" // Increased padding and text size
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !validateAddress(companyAddress) || !creditAmount}
                    className="w-full px-4 py-3 text-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-md hover:from-yellow-600 hover:to-amber-600 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-800" // Increased text size
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Adding Credits...
                        </div>
                    ) : (
                        'Approve Carbon Credits'
                    )}
                </button>
            </form>
        </div>
    );
};

export { CarbonCreditsManager };