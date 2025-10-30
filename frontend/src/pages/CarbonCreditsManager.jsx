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
        <div className="relative overflow-hidden bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea] min-h-screen text-[#0f2d1c] flex items-center justify-center py-16">
            {/* --- Subtle Gradient Green Backgrounds (copied from Home) --- */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div
                    className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
                    style={{
                        background:
                            "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)",
                    }}
                />
                <div
                    className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
                    style={{
                        background:
                            "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)",
                    }}
                />
                <div
                    className="absolute left-1/2 top-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20"
                    style={{
                        background:
                            "conic-gradient(from 90deg at 50% 50%, #d8f3dc 0deg, #74c69d 120deg, #b7e4c7 240deg, #d8f3dc 360deg)",
                    }}
                />
            </div>
            {/* --- End Gradient Backgrounds --- */}

            <main className="relative z-10 w-full max-w-2xl mx-auto">
                <div className="p-10 rounded-3xl bg-white/50 backdrop-blur-xl shadow-xl border border-[#3a5a40]/20">
                    <h3 className="text-3xl font-extrabold text-[#1b4332] mb-10 text-center tracking-tight">
                        Approve Carbon Credits
                    </h3>

                    <form onSubmit={handleAddCredits} className="space-y-8">
                        <div>
                            <label htmlFor="companyAddress" className="block text-base font-semibold text-[#1b4332] mb-2">
                                Company Address:
                            </label>
                            <input
                                type="text"
                                id="companyAddress"
                                value={companyAddress}
                                onChange={(e) => setCompanyAddress(e.target.value)}
                                placeholder="0x..."
                                required
                                className={`w-full px-4 py-3 border rounded-xl shadow-sm bg-white/70 text-[#1b4332] text-lg placeholder-[#3a5a40]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-[#4a6741] transition-all ${
                                    companyAddress && !validateAddress(companyAddress)
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
                                        : 'border-[#3a5a40]/20'
                                }`}
                            />
                            {companyAddress && !validateAddress(companyAddress) && (
                                <p className="mt-2 text-base text-red-500 font-semibold">Invalid Ethereum address</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="creditAmount" className="block text-base font-semibold text-[#1b4332] mb-2">
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
                                className="w-full px-4 py-3 border rounded-xl shadow-sm bg-white/70 text-[#1b4332] text-lg placeholder-[#3a5a40]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-[#4a6741] transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !validateAddress(companyAddress) || !creditAmount}
                            className="w-full px-4 py-3 text-lg bg-gradient-to-r from-[#1b4332] to-[#3a5a40] text-white font-bold rounded-full hover:from-[#3a5a40] hover:to-[#1b4332] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:ring-offset-2 focus:ring-offset-white disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed"
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
            </main>
        </div>
    );
};

export { CarbonCreditsManager };