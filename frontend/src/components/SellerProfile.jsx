import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, MapPin, Calendar, CheckCircle, AlertCircle, 
    FileText, Link as LinkIcon, ShieldCheck, Globe, BookOpen, Hash 
} from 'lucide-react';
import { ethers } from 'ethers';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

// --- Load ABI from local file ---
import CONTRACT_ABI from '../abi/CarbonCreditMarketplace.json';

// --- Constants ---
const CARBON_CONTRACT_ADDRESS = import.meta.env.VITE_CARBON_CONTRACT_ADDRESS || "0x2b22Ed957d4A0D7cF11Fe049e936a94b2EF05Fb6";
const RPC_URL = "https://testnet.hashio.io/api";

// Helper component for displaying badges
const InfoBadge = ({ text, icon, color = 'blue' }) => {
    const colorClasses = {
        green: 'bg-green-500/10 text-green-400',
        blue: 'bg-blue-500/10 text-blue-400',
    };
    return (
        <span className={`flex items-center space-x-1.5 text-xs font-medium px-2 py-1 rounded-full ${colorClasses[color]}`}>
            {icon}
            <span>{text}</span>
        </span>
    );
};


export function SellerProfile() {
  const { sellerAddress } = useParams();
  const navigate = useNavigate();

  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!sellerAddress) return;

      setLoading(true);
      setError(null);

      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CARBON_CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const activeIds = await contract.getActiveCarbonCreditListings();
        const allListingsDetails = await Promise.all(
          activeIds.map(id => contract.getListingDetails(id))
        );

        const sellerListings = allListingsDetails
          .filter(details => details.seller.toLowerCase() === sellerAddress.toLowerCase())
          .map(details => {
            // Destructuring the returned array for clarity based on the Solidity structs
            const [, , , , , projectInfo, projectDocs, creditDetails] = details;

            return {
              id: details.id.toString(),
              amount: Number(details.amount),
              pricePerCredit: parseFloat(ethers.formatUnits(details.pricePerCredit,8)),
              
              // ProjectInfo
              projectName: projectInfo.projectName,
              projectType: projectInfo.projectType,
              projectCountry: projectInfo.projectCountry,
              projectRegion: projectInfo.projectRegion,
              projectAddress: projectInfo.projectAddress,
              registryUrl: projectInfo.registryUrl,

              // ProjectDocs
              accreditedRegistry: projectDocs.accreditedRegistry,
              registryStandard: projectDocs.registryStandard,
              hostCountryAuthorization: projectDocs.hostCountryAuthorization,
              authorizationLetter: projectDocs.authorizationLetter,
              parisAgreementCompliant: projectDocs.parisAgreementCompliant,
              projectDocumentation: projectDocs.projectDocumentation,
              isVerified: projectDocs.isVerified,

              // CreditDetails
              creditVintageYear: Number(creditDetails.creditVintageYear),
              vintageSerialNumbers: creditDetails.vintageSerialNumbers,
            };
          });
        
        const unlistedCredits = await contract.carbonCreditsOwned(sellerAddress);
        const totalListed = sellerListings.reduce((sum, l) => sum + l.amount, 0);
        const avgPrice = sellerListings.length > 0
            ? (sellerListings.reduce((sum, l) => sum + l.pricePerCredit, 0) / sellerListings.length)
            : 0;

        setSellerData({
          id: sellerAddress,
          name: `Seller ${sellerAddress.slice(0, 6)}...${sellerAddress.slice(-4)}`,
          verified: sellerListings.some(l => l.isVerified), // True if at least one project is verified
          location: sellerListings.length > 0 ? `${sellerListings[0].projectRegion}, ${sellerListings[0].projectCountry}` : "Unknown Location",
          firstVintage: sellerListings.length > 0 ? Math.min(...sellerListings.map(l => l.creditVintageYear)) : "N/A",
          primaryRegistry: sellerListings.length > 0 ? sellerListings[0].accreditedRegistry : "N/A",
          unlistedCredits: Number(unlistedCredits),
          totalListedCredits: totalListed,
          listings: sellerListings,
          avgPrice: avgPrice.toFixed(4),
        });

      } catch (err) {
        console.error("Error fetching seller data:", err);
        setError("Could not fetch seller details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerAddress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !sellerData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <ErrorMessage message={error || "Seller data could not be loaded."} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 min-h-screen"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1632834784573-f212a0b4586b?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          zIndex: 0,
        }}
      ></div>

      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 mb-6 relative z-10"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Marketplace</span>
      </button>

      {/* Seller Header */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-8 mb-8 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{sellerData.name}</h1>
              {sellerData.verified ? (
                <CheckCircle className="h-6 w-6 text-emerald-400" title="This seller has verified projects" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-400" title="This seller has no verified projects" />
              )}
            </div>
            <div className="flex items-center text-slate-400 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{sellerData.location}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-slate-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Projects since {sellerData.firstVintage}</span>
              </div>
              <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                📊 {sellerData.primaryRegistry}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Unlisted Credits</h3>
          <div className="text-3xl font-bold text-white mb-2">{sellerData.unlistedCredits.toLocaleString()}</div>
          <div className="text-slate-400 text-sm">Credits held on-chain</div>
        </div>
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Total Listed Credits</h3>
          <div className="text-3xl font-bold text-white mb-2">{sellerData.totalListedCredits.toLocaleString()}</div>
          <div className="text-slate-400 text-sm">tons CO₂ for sale</div>
        </div>
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Average Price</h3>
          <div className="text-3xl font-bold text-white mb-2">{sellerData.avgPrice} HBAR</div>
          <div className="text-slate-400 text-sm">per ton</div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-white">Current Listings from this Seller</h3>
        {sellerData.listings.length === 0 ? (
          <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 text-center text-slate-400">
            This seller has no active listings.
          </div>
        ) : (
          sellerData.listings.map((listing) => (
            <div key={listing.id} className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h4 className="text-xl font-bold text-white">{listing.projectName}</h4>
                      <p className="text-sm text-slate-400">{listing.projectRegion}, {listing.projectCountry} (Vintage: {listing.creditVintageYear})</p>
                  </div>
                  <div className="text-right">
                      <p className="text-xl font-bold text-emerald-400">{listing.pricePerCredit.toFixed(4)} HBAR</p>
                      <p className="text-sm text-slate-400">/ ton CO₂</p>
                  </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                  {listing.isVerified && <InfoBadge text="Verified" icon={<ShieldCheck size={14} />} color="green" />}
                  {listing.parisAgreementCompliant && <InfoBadge text="Paris Agreement" icon={<Globe size={14} />} color="blue" />}
                  {listing.hostCountryAuthorization && <InfoBadge text="Host Country Auth." icon={<CheckCircle size={14} />} color="green" />}
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-700 pt-4">
                  <div className="text-sm">
                      <p className="text-slate-400">Available Credits</p>
                      <p className="text-white font-medium">{listing.amount.toLocaleString()} tons</p>
                  </div>
                  <div className="text-sm">
                      <p className="text-slate-400">Project Type</p>
                      <p className="text-white font-medium">{listing.projectType}</p>
                  </div>
                  <div className="text-sm">
                      <p className="text-slate-400">Registry</p>
                      <p className="text-white font-medium">{listing.accreditedRegistry}</p>
                  </div>
                  <div className="text-sm">
                      <p className="text-slate-400">Registry Standard</p>
                      <p className="text-white font-medium">{listing.registryStandard}</p>
                  </div>
                   <div className="text-sm md:col-span-2">
                      <p className="text-slate-400">Serial Numbers</p>
                      <p className="text-white font-medium break-words text-xs">{listing.vintageSerialNumbers || 'N/A'}</p>
                  </div>

                  {/* Links */}
                  <div className="md:col-span-2 flex flex-wrap gap-4 pt-2">
                       <a href={listing.registryUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 text-sm">
                          <LinkIcon size={14} /> <span>View on Registry</span>
                       </a>
                        <a href={listing.projectDocumentation} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 text-sm">
                          <BookOpen size={14} /> <span>Project Docs</span>
                       </a>
                       <a href={listing.authorizationLetter} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 text-sm">
                          <FileText size={14} /> <span>Auth. Letter</span>
                       </a>
                  </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}