import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { Analytics } from './pages/Analytics';
import { Footer } from './components/Footer';
import ForestDAO from './pages/ForestDAO';
import { CompanyRegistration } from './pages/CompanyRegistration';
import { CarbonCreditSellerRegistration } from './pages/CarbonCreditSellerRegistration';
import { RegistrationSuccess } from './components/RegistrationSuccess';
import { SuccessMessage } from './components/SuccessMessage';
import CompanyProfile from './pages/Profile';
import { SellerProfile } from './pages/SellerProfile';
import {Buy} from './components/Buy';
import {ForestSellerRegistration} from './pages/ForestSellerRegistration';
import {ForestProfile} from './pages/ForestProfile';
import {BuyForest} from './components/BuyForest'; 
import {CarbonCreditsManager} from './pages/CarbonCreditsManager';
import {CompanyVerificationManager} from './pages/CompanyVerificationManager';
import { ToastProvider } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import KycAdmin from './components/GrantKyc';
import { ManageRelayers } from './components/ManageRelayer';
import { WithdrawFees } from './components/WithdrawFees';
import RelayerDashboard from './pages/RelayerDashboard';
import { DocsPage } from './pages/Docs';

function App() {
  const [analytics, setAnalytics] = useState({
    totalCredits: 500000,
    avgPrice: 12.5,
    co2Offset: 1000000,
    activeProjects: 120,
    totalValueLocked: 25000000,
    verificationRate: 98,
    activeBuyers: 1500,
    volume24h: 1250000,
  });

  const [carbonCredits] = useState([
    {
      id: 1,
      title: 'Amazon Rainforest Conservation',
      location: 'Brazil',
      price: 15,
      vintage: 2023,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=6000',
      type: 'forest',
      verified: true,
      co2Reduction: 10000,
      realDataSource: 'Global Forest Watch',
      rating: 4.5,
      availableCredits: 5000,
      totalCredits: 10000,
      priceChange: 2.5,
      companyId: 1,
    },
    {
      id: 2,
      title: 'Wind Farm Project',
      location: 'USA',
      price: 20,
      vintage: 2024,
      image: 'https://images.unsplash.com/photo-1422493757035-1e5e02378135?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=6000',
      type: 'carbon',
      verified: true,
      co2Reduction: 25000,
      realDataSource: 'World Bank',
      rating: 4.8,
      availableCredits: 15000,
      totalCredits: 20000,
      priceChange: -1.2,
      companyId: 2,
    },
  ]);

  const [companies] = useState([
    {
      id: 1,
      name: 'Eco Corp',
      logo: 'url_to_logo',
      location: 'USA',
      industry: 'Technology',
      esgScore: 85,
      foundedYear: 2010,
      verified: true,
      realDataSource: 'S&P Global',
      carbonFootprint: 50000,
      footprintChange: -5,
      deforestationRate: 0,
      totalCreditsPurchased: 10000,
      netZeroTarget: 2040,
      renewableEnergyUsage: 60,
      purchaseHistory: [
        {
          project: 'Amazon Rainforest Conservation',
          date: '2023-10-26',
          credits: 5000,
          price: 15,
        },
      ],
    },
    {
      id: 2,
      name: 'Global Energy Inc.',
      logo: 'url_to_logo',
      location: 'Germany',
      industry: 'Energy',
      esgScore: 60,
      foundedYear: 1995,
      verified: false,
      realDataSource: 'Bloomberg',
      carbonFootprint: 1000000,
      footprintChange: 2,
      deforestationRate: 100,
      totalCreditsPurchased: 20000,
      netZeroTarget: 2050,
      renewableEnergyUsage: 20,
      purchaseHistory: [
        {
          project: 'Wind Farm Project',
          date: '2024-01-15',
          credits: 10000,
          price: 20,
        },
      ],
    },
  ]);

  console.log("App loaded successfully");

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-900 text-white" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)'
      }}>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home analytics={analytics} />}/>
            <Route path="/marketplace" element={<Marketplace carbonCredits={carbonCredits} analytics={analytics} />} />
            <Route path="/analytics" element={<Analytics analytics={analytics} />} />
            <Route path="/register" element={<CompanyRegistration />} />
            <Route path="/register-seller" element={<CarbonCreditSellerRegistration />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/profile/:companyId" element={<CompanyProfile companies={companies} />} />
            <Route path="/company/:sellerAddress" element={<SellerProfile />} />
            <Route path="/purchase/:projectId" element={<Buy />} />
            <Route path="/forest-seller-registration" element={<ForestSellerRegistration />} />
            <Route path="/forest/:id" element={<ForestProfile />} />
            <Route path="/buy-forest/:id" element={<BuyForest />} />
            <Route path="/success" element={<SuccessMessage />} />
            <Route path="/verify-company" element={<CompanyVerificationManager />} />
            <Route path="/manage-credits" element={<CarbonCreditsManager />} />
            <Route path="/grant-kyc" element={<KycAdmin />} />
            <Route path="/manage-relayers" element={<ManageRelayers />} />
            <Route path="/withdraw-fees" element={<WithdrawFees />} />
            <Route path="/relayer-dashboard" element={<RelayerDashboard />} />
            <Route path="/dao" element={<ForestDAO />} />
            <Route path="/documentation" element={<DocsPage />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}

export default App;
