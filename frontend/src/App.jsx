import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marketplace } from './components/Marketplace.jsx';
import { CompanyProfile } from './components/CompanyProfile';
import { Analytics } from './components/Analytics';
import { Footer } from './components/Footer';
import { APITestPanel } from './components/APITestPanel';
import { CompanyRegistration } from './components/CompanyRegistration';
import { CarbonCreditSellerRegistration } from './components/CarbonCreditSellerRegistration';
import { RegistrationSuccess } from './components/RegistrationSuccess';
import { SuccessMessage } from './components/SuccessMessage';

function App() {
  const [currentView, setCurrentView] = useState('marketplace');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
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
  const [carbonCredits, setCarbonCredits] = useState([
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
  const [companies, setCompanies] = useState([
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

  const handleViewCompany = (companyId) => {
    setSelectedCompanyId(companyId);
    setCurrentView('company');
  };

  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);

  const handleRegistrationComplete = (successData) => {
    setRegistrationData(successData);
    setCurrentView('registration-success');
  };

  const handleProceedToSeller = () => {
    setCurrentView('register-seller');
  };

  const handleBackToMarketplace = () => {
    // Show success message on marketplace
    setRegistrationSuccess(registrationData);
    setCurrentView('marketplace');
    // Clear success message after 5 seconds
    setTimeout(() => setRegistrationSuccess(null), 5000);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'company':
        return <CompanyProfile companies={companies} companyId={selectedCompanyId} onBack={() => setCurrentView('marketplace')} />;
      case 'analytics':
        return <Analytics analytics={analytics} />;
      case 'register':
        return <CompanyRegistration onBack={() => setCurrentView('marketplace')} onRegistrationComplete={handleRegistrationComplete} />;
      case 'registration-success':
        return (
          <RegistrationSuccess
            registrationData={registrationData}
            onProceedToSeller={handleProceedToSeller}
            onBackToMarketplace={handleBackToMarketplace}
          />
        );
      case 'register-seller':
        return <CarbonCreditSellerRegistration onBack={() => setCurrentView('marketplace')} onRegistrationComplete={handleBackToMarketplace} />;
      default:
        return <Marketplace carbonCredits={carbonCredits} analytics={analytics} onViewCompany={handleViewCompany} />;
    }
  };

  const isRegistrationView = ['register', 'register-seller', 'registration-success'].includes(currentView);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800">
      {!isRegistrationView && <Navbar currentView={currentView} onViewChange={setCurrentView} />}
      {currentView === 'marketplace' && <Hero analytics={analytics} />}
      {registrationSuccess && currentView === 'marketplace' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SuccessMessage 
            message="Company registration completed successfully! Your registration is now on the blockchain."
            transactionHash={registrationSuccess.transactionHash}
            onClose={() => setRegistrationSuccess(null)}
          />
        </div>
      )}
      {renderContent()}
      {!isRegistrationView && <Footer />}
      {!isRegistrationView && <APITestPanel />}
    </div>
  );
}

export default App;