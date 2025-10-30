import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Check, X, ShieldQuestion } from "lucide-react";
import COMPANY_ABI from "../abi/HandleCompany.json";

const CompanyVerificationManager = () => {
    const [pendingCompanies, setPendingCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actioningCompany, setActioningCompany] = useState(null); // To disable buttons for a specific company
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const COMPANY_ADDRESS = import.meta.env.VITE_COMPANY_CONTRACT_ADDRESS;

    useEffect(() => {
        fetchPendingCompanies();
    }, []);

    const fetchPendingCompanies = async () => {
        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(COMPANY_ADDRESS, COMPANY_ABI, provider);
            const addresses = await contract.getPendingVerificationCompanies();
            
            const companiesData = await Promise.all(
                addresses.map(async (address) => {
                    const details = await contract.getCompanyDetails(address);
                    return {
                        address,
                        name: details.name,
                        hederaAccountId: details.hederaAccountId,
                        registrationTimestamp: details.registrationTimestamp
                    };
                })
            );

            setPendingCompanies(companiesData);
        } catch (error) {
            console.error('Error fetching pending companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCompany = async (companyAddress) => {
        try {
            setActioningCompany(companyAddress);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(COMPANY_ADDRESS, COMPANY_ABI, signer);

            const tx = await contract.verifyCompany(companyAddress);
            await tx.wait();

            alert('Company verified successfully!');
            fetchPendingCompanies(); // Refresh list
        } catch (error) {
            console.error('Error verifying company:', error);
            alert('Error verifying company: ' + error.message);
        } finally {
            setActioningCompany(null);
        }
    };

    const handleRejectCompany = async (companyAddress) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            setActioningCompany(companyAddress);
            // BUG FIX: Instantiate provider and signer within the handler
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(COMPANY_ADDRESS, COMPANY_ABI, signer);

            const tx = await contract.rejectCompany(companyAddress, rejectionReason);
            await tx.wait();

            alert('Company rejected successfully!');
            setRejectionReason('');
            setSelectedCompany(null);
            fetchPendingCompanies(); // Refresh list
        } catch (error) {
            console.error('Error rejecting company:', error);
            alert('Error rejecting company: ' + error.message);
        } finally {
            setActioningCompany(null);
        }
    };

    const formatTimestamp = (timestamp) => {
        try {
            return new Date(Number(timestamp) * 1000).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
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

            <main className="relative z-10 w-full max-w-4xl mx-auto">
                <div className="p-10 rounded-3xl bg-white/50 backdrop-blur-xl shadow-xl border border-[#3a5a40]/20">
                    <h3 className="text-3xl font-extrabold text-[#1b4332] mb-10 text-center tracking-tight">
                        Company Verification
                    </h3>

                    {loading && pendingCompanies.length === 0 && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#40916c]"></div>
                            <span className="ml-3 text-[#3a5a40]">Loading Pending Companies...</span>
                        </div>
                    )}

                    {!loading && pendingCompanies.length === 0 ? (
                        <div className="text-center py-8 bg-white/60 rounded-2xl border border-[#3a5a40]/10">
                            <Check className="h-12 w-12 text-[#40916c] mx-auto mb-4" />
                            <p className="text-[#3a5a40] text-lg">No companies are currently pending verification.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {pendingCompanies.map((company) => (
                                <div key={company.address} className="bg-white/70 rounded-2xl p-8 border border-[#3a5a40]/10 shadow-md transition-all">
                                    <h4 className="text-2xl font-bold text-[#1b4332] mb-4 flex items-center">
                                        <ShieldQuestion className="h-6 w-6 mr-3 text-[#40916c]"/>
                                        {company.name}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base mb-6">
                                        {/* Styled Info Boxes */}
                                        <div className="bg-white/60 p-3 rounded-lg border border-[#3a5a40]/10"><span className="font-medium text-[#3a5a40] block">Address:</span> <span className="font-mono text-[#1b4332]">{company.address}</span></div>
                                        <div className="bg-white/60 p-3 rounded-lg border border-[#3a5a40]/10"><span className="font-medium text-[#3a5a40] block">Hedera Account:</span> <span className="font-mono text-[#1b4332]">{company.hederaAccountId}</span></div>
                                        <div className="bg-white/60 p-3 rounded-lg border border-[#3a5a40]/10"><span className="font-medium text-[#3a5a40] block">Registration Date:</span> <span className="font-mono text-[#1b4332]">{formatTimestamp(company.registrationTimestamp)}</span></div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <button
                                            onClick={() => handleVerifyCompany(company.address)}
                                            disabled={!!actioningCompany}
                                            className="px-6 py-2 bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white font-bold rounded-full hover:from-[#40916c] hover:to-[#1b4332] disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            <Check size={18}/> Verify
                                        </button>
                                        <button
                                            onClick={() => setSelectedCompany(company.address === selectedCompany ? null : company.address)}
                                            disabled={!!actioningCompany}
                                            className="px-6 py-2 bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white font-bold rounded-full hover:from-[#ef4444] hover:to-[#b91c1c] disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            <X size={18}/> Reject
                                        </button>
                                    </div>

                                    {selectedCompany === company.address && (
                                        <div className="bg-white/80 border border-red-400/30 rounded-xl p-5 mt-4">
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Enter rejection reason..."
                                                rows="3"
                                                className="w-full p-3 bg-white/60 text-[#1b4332] placeholder-[#3a5a40]/40 border border-[#3a5a40]/20 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none transition-all"
                                            />
                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={() => handleRejectCompany(company.address)}
                                                    disabled={!!actioningCompany || !rejectionReason.trim()}
                                                    className="px-5 py-2 bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white font-bold rounded-full hover:from-[#ef4444] hover:to-[#b91c1c] disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed transition-all"
                                                >
                                                    Confirm Rejection
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedCompany(null); setRejectionReason(''); }}
                                                    className="px-5 py-2 bg-[#3a5a40]/30 text-[#1b4332] rounded-full hover:bg-[#3a5a40]/50 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export { CompanyVerificationManager };