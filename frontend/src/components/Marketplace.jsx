import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Star, TreePine, Factory, MapPin, Calendar, Award } from 'lucide-react'; // Added MapPin, Calendar, Award
import { ethers } from 'ethers';
import { CreditCard } from './CreditCard'; // Assuming this component exists and takes 'credit' prop
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

// --- Configuration ---
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE"; // <<< IMPORTANT: Replace with your actual contract address
const RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"; // <<< IMPORTANT: Replace with your RPC URL (e.g., from Infura/Alchemy) or a public RPC like "https://rpc.sepolia.org"

// Minimal ABI for the functions we need to call
const CONTRACT_ABI = [
  "function getActiveCarbonCreditListings() view returns (uint256[] memory)",
  "function getListingDetails(uint256 _listingId) view returns (uint256 id, address seller, uint256 amount, uint256 pricePerCredit, bool isActive, string projectName, string projectType, string projectCountry, string projectRegion, string projectAddress, string registryUrl, string accreditedRegistry, string registryStandard, bool hostCountryAuthorization, string authorizationLetter, bool parisAgreementCompliant, string projectDocumentation, bool isVerified, uint256 creditVintageYear, string vintageSerialNumbers)",
];

function Marketplace({ onViewCompany }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'carbon', 'forest'
  const [listings, setListings] = useState([]); // Stores fetched carbon credit listings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalCredits: 0,
    activeProjects: 0,
    totalValueLocked: 0,
    verificationRate: 0,
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const activeListingIds = await contract.getActiveCarbonCreditListings();
      
      const fetchedDetails = await Promise.all(
        activeListingIds.map(async (id) => {
          const listing = await contract.getListingDetails(id);
          
          // Map contract data to a format suitable for the CreditCard component
          // The CreditCard component is assumed to have props like id, title, location, type, etc.
          return {
            id: listing.id.toNumber(),
            imageUrl: `/images/project-${listing.id.toNumber() % 3}.jpg`, // Simple placeholder image
            type: listing.projectType.toLowerCase().includes('forest') || listing.projectType.toLowerCase().includes('reforestation') || listing.projectType.toLowerCase().includes('afforestation') ? 'forest' : 'carbon',
            verified: listing.isVerified,
            title: listing.projectName,
            location: listing.projectCountry,
            reduction: "Estimated CO2 Reduction (TBD)", // Not directly from contract, needs off-chain calculation or a mock
            issuer: listing.accreditedRegistry,
            rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Mock rating
            year: listing.creditVintageYear.toNumber(),
            available: listing.amount.toNumber(),
            price: parseFloat(ethers.utils.formatEther(listing.pricePerCredit)), // Price in ETH
            priceChange: (Math.random() * 5 - 2.5).toFixed(1), // Mock price change
            // Additional details for 'View Details' or more complex rendering if needed
            seller: listing.seller,
            projectType: listing.projectType,
            projectRegion: listing.projectRegion,
            projectAddress: listing.projectAddress,
            registryUrl: listing.registryUrl,
            registryStandard: listing.registryStandard,
            hostCountryAuthorization: listing.hostCountryAuthorization,
            parisAgreementCompliant: listing.parisAgreementCompliant,
          };
        })
      );

      setListings(fetchedDetails);

      // Calculate analytics
      let totalCredits = 0;
      let activeProjects = 0;
      let totalValueLocked = ethers.BigNumber.from(0);
      let verifiedCount = 0;

      for (const listing of fetchedDetails) {
        if (listing.isActive) { // Assuming listing.isActive is part of the mapped object now, or just use `true` since we fetched active ones
            totalCredits += listing.available;
            activeProjects++;
            // totalPrice is amount * pricePerCredit (BigNumber * BigNumber)
            totalValueLocked = totalValueLocked.add(ethers.BigNumber.from(listing.available).mul(ethers.utils.parseEther(listing.price.toString())));
            if (listing.verified) {
                verifiedCount++;
            }
        }
      }

      setAnalytics({
        totalCredits: totalCredits,
        activeProjects: activeProjects,
        totalValueLocked: parseFloat(ethers.utils.formatEther(totalValueLocked)), // Convert TVL to ETH (or USD if you integrate an oracle)
        verificationRate: activeProjects > 0 ? ((verifiedCount / activeProjects) * 100).toFixed(0) : 0,
      });

    } catch (err) {
      console.error("Error fetching carbon credit listings:", err);
      setError("Failed to load listings. Please check your network connection or contract configuration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredCredits = listings.filter(credit => {
    const matchesSearch = credit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.projectType.toLowerCase().includes(searchTerm.toLowerCase()) || // Include project type in search
                         credit.issuer.toLowerCase().includes(searchTerm.toLowerCase()); // Include issuer in search

    const matchesFilter = filterType === 'all' || credit.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <LoadingSpinner />
        <p className="ml-3 text-emerald-400">Loading carbon credit listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filters */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 mb-8 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search carbon credits, projects, locations, or issuers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('carbon')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                filterType === 'carbon'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <Factory className="h-4 w-4" />
              <span>Carbon Credits</span>
            </button>
            <button
              onClick={() => setFilterType('forest')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                filterType === 'forest'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <TreePine className="h-4 w-4" />
              <span>Forest Tokens</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-xl p-4 border border-emerald-500/20">
          <div className="text-2xl font-bold text-white">{analytics.totalCredits.toLocaleString()}</div>
          <div className="text-emerald-300 text-sm">Total Credits Available</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
          <div className="text-2xl font-bold text-white">{analytics.activeProjects}</div>
          <div className="text-blue-300 text-sm">Active Projects</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-white">{analytics.totalValueLocked.toFixed(2)} ETH</div> {/* Display in ETH */}
          <div className="text-purple-300 text-sm">Total Value Locked</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-4 border border-orange-500/20">
          <div className="text-2xl font-bold text-white">{analytics.verificationRate}%</div>
          <div className="text-orange-300 text-sm">Verification Rate</div>
        </div>
      </div>

      {/* Credits Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCredits.map((credit) => (
          // Make sure your CreditCard component can handle these props
          <CreditCard 
            key={credit.id} 
            credit={{
              ...credit,
              price: `${credit.price.toFixed(4)} ETH`, // Format price for display
              // You might want to pass more raw data for a "View Details" page
            }}
            onViewCompany={onViewCompany}
          />
        ))}
      </div>

      {filteredCredits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg mb-2">No credits found</div>
          <div className="text-slate-500">Try adjusting your search or filters</div>
        </div>
      )}
    </div>
  );
}

export { Marketplace };