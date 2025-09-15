import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marketplace } from './components/Marketplace';
import { CompanyProfile } from './components/CompanyProfile';
import { Analytics } from './components/Analytics';
import { Footer } from './components/Footer';
import { APITestPanel } from './components/APITestPanel';

function App() {
  const [currentView, setCurrentView] = useState('marketplace');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const handleViewCompany = (companyId) => {
    setSelectedCompanyId(companyId);
    setCurrentView('company');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'company':
        return <CompanyProfile companyId={selectedCompanyId} onBack={() => setCurrentView('marketplace')} />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Marketplace onViewCompany={handleViewCompany} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      {currentView === 'marketplace' && <Hero />}
      {renderContent()}
      <Footer />
      <APITestPanel />
    </div>
  );
}

export default App;