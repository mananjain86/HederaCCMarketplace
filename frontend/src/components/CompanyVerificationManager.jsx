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
        <div className="max-w-4xl mx-auto mt-10 p-8 rounded-xl bg-slate-800/70 backdrop-blur-md border border-slate-700/50 mb-10">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Company Verification</h3>

            {loading && pendingCompanies.length === 0 && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    <span className="ml-3 text-slate-300">Loading Pending Companies...</span>
                </div>
            )}

            {!loading && pendingCompanies.length === 0 ? (
                <div className="text-center py-8 bg-slate-900/50 rounded-lg">
                    <Check className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">No companies are currently pending verification.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {pendingCompanies.map((company) => (
                        <div key={company.address} className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 transition-all">
                            <h4 className="text-2xl font-semibold text-white mb-4 flex items-center">
                                <ShieldQuestion className="h-6 w-6 mr-3 text-yellow-400"/>
                                {company.name}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                                {/* Styled Info Boxes */}
                                <div className="bg-slate-800 p-3 rounded-md"><span className="font-medium text-slate-400 block">Address:</span> <span className="font-mono text-slate-200">{company.address}</span></div>
                                <div className="bg-slate-800 p-3 rounded-md"><span className="font-medium text-slate-400 block">Hedera Account:</span> <span className="font-mono text-slate-200">{company.hederaAccountId}</span></div>
                                <div className="bg-slate-800 p-3 rounded-md"><span className="font-medium text-slate-400 block">Registration Date:</span> <span className="font-mono text-slate-200">{formatTimestamp(company.registrationTimestamp)}</span></div>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-4">
                                <button
                                    onClick={() => handleVerifyCompany(company.address)}
                                    disabled={!!actioningCompany}
                                    className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <Check size={18}/> Verify
                                </button>
                                <button
                                    onClick={() => setSelectedCompany(company.address === selectedCompany ? null : company.address)}
                                    disabled={!!actioningCompany}
                                    className="px-5 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <X size={18}/> Reject
                                </button>
                            </div>

                            {selectedCompany === company.address && (
                                <div className="bg-slate-800 border border-red-500/30 rounded-lg p-4 mt-4">
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Enter rejection reason..."
                                        rows="3"
                                        className="w-full p-3 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-colors"
                                    />
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => handleRejectCompany(company.address)}
                                            disabled={!!actioningCompany || !rejectionReason.trim()}
                                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Confirm Rejection
                                        </button>
                                        <button
                                            onClick={() => { setSelectedCompany(null); setRejectionReason(''); }}
                                            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors"
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
    );
};

export { CompanyVerificationManager };