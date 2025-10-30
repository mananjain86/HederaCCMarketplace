import React, { useState } from 'react';
import { TestTube, CheckCircle, XCircle, RefreshCw, Database, Globe, Wind } from 'lucide-react';

export function APITestPanel() {
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const runAPITests = async () => {
    setTesting(true);
    try {
      setTestResults([]);
    } catch (error) {
      console.error('Error running API tests:', error);
      setTestResults({});
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === undefined) return <div className="w-4 h-4 bg-[#b7e4c7]/40 rounded-full animate-pulse" />;
    return status ? 
      <CheckCircle className="w-4 h-4 text-[#40916c]" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-white/70 backdrop-blur-xl border border-[#3a5a40]/20 text-[#40916c] p-3 rounded-full hover:bg-[#b7e4c7]/40 transition-all shadow-xl"
        title="Test APIs"
      >
        <TestTube className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white/80 backdrop-blur-xl border border-[#3a5a40]/20 rounded-2xl p-6 w-80 shadow-2xl text-[#1b4332]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TestTube className="w-5 h-5 text-[#40916c]" />
          <h3 className="text-lg font-extrabold text-[#1b4332]">API Status</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[#3a5a40]/60 hover:text-[#1b4332] transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-[#40916c]"
          aria-label="Close API Test Panel"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-2 bg-[#e8f1ea] rounded-xl border border-[#3a5a40]/10">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="text-[#3a5a40] text-sm font-semibold">World Bank API</span>
          </div>
          {getStatusIcon(testResults?.['World Bank'])}
        </div>

        <div className="flex items-center justify-between p-2 bg-[#e8f1ea] rounded-xl border border-[#3a5a40]/10">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-[#40916c]" />
            <span className="text-[#3a5a40] text-sm font-semibold">REST Countries API</span>
          </div>
          {getStatusIcon(testResults?.['REST Countries'])}
        </div>

        <div className="flex items-center justify-between p-2 bg-[#e8f1ea] rounded-xl border border-[#3a5a40]/10">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-cyan-500" />
            <span className="text-[#3a5a40] text-sm font-semibold">OpenAQ API</span>
          </div>
          {getStatusIcon(testResults?.['OpenAQ'])}
        </div>
      </div>

      <button
        onClick={runAPITests}
        disabled={testing}
        className="w-full bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white py-2 px-4 rounded-full font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {testing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Testing...</span>
          </>
        ) : (
          <>
            <TestTube className="w-4 h-4" />
            <span>Test APIs</span>
          </>
        )}
      </button>

      {testResults && (
        <div className="mt-3 text-xs text-[#3a5a40]">
          Last tested: {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}