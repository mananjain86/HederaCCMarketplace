import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import COMPANY_ABI from "../abi/HandleCompany.json"

const CompanyVerificationManager = () => {
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
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
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(COMPANY_ADDRESS, COMPANY_ABI, signer);
      const addresses = await contract.getPendingVerificationCompanies();
      console.log(addresses);
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
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(COMPANY_ADDRESS, COMPANY_ABI, signer);

      const tx = await contract.verifyCompany(companyAddress);
      await tx.wait();

      alert('Company verified successfully!');
      fetchPendingCompanies();
    } catch (error) {
      console.error('Error verifying company:', error);
      alert('Error verifying company: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCompany = async (companyAddress) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setLoading(true);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.rejectCompany(companyAddress, rejectionReason);
      await tx.wait();

      alert('Company rejected successfully!');
      setRejectionReason('');
      setSelectedCompany(null);
      fetchPendingCompanies();
    } catch (error) {
      console.error('Error rejecting company:', error);
      alert('Error rejecting company: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      // Convert BigInt to Number for timestamp calculation
      const timestampNumber = Number(timestamp);
      return new Date(timestampNumber * 1000).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid Date';
    }
  };
  return (
    <div className="p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-6">Company Verification Management</h3>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      )}

      {pendingCompanies.length === 0 && !loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No companies pending verification</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingCompanies.map((company) => (
            <div key={company.address} className=" border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-blue-600 mb-2">{company.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white">
                  <p><span className="font-medium">Address:</span> {company.address.slice(0, 10)}...{company.address.slice(-8)}</p>
                  <p><span className="font-medium">Hedera Account:</span> {company.hederaAccountId}</p>
                  <p><span className="font-medium">Registration Date:</span> {formatTimestamp(company.registrationTimestamp)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => handleVerifyCompany(company.address)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Verify
                </button>

                <button
                  onClick={() => setSelectedCompany(company.address)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Reject
                </button>
              </div>

              {selectedCompany === company.address && (
                <div className="bg-white border border-gray-300 rounded-md p-4">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleRejectCompany(company.address)}
                      disabled={loading || !rejectionReason.trim()}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCompany(null);
                        setRejectionReason('');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
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