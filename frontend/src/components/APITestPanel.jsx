import React, { useState } from 'react';
import { TestTube, CheckCircle, XCircle, RefreshCw, Database, Globe, Wind } from 'lucide-react';
import { realDataService } from '../services/realDataService';

export function APITestPanel() {
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const runAPITests = async () => {
    setTesting(true);
    try {
      const results = await realDataService.testAllAPIs();
      setTestResults(results);
    } catch (error) {
      console.error('Error running API tests:', error);
      setTestResults({});
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === undefined) return <div className="w-4 h-4 bg-slate-600 rounded-full animate-pulse" />;
    return status ? 
      <CheckCircle className="w-4 h-4 text-emerald-400" /> : 
      <XCircle className="w-4 h-4 text-red-400" />;
  };

  const getStatusColor = (status) => {
    if (status === undefined) return 'text-slate-400';
    return status ? 'text-emerald-400' : 'text-red-400';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 text-emerald-400 p-3 rounded-full hover:bg-slate-700/90 transition-all shadow-lg"
        title="Test APIs"
      >
        <TestTube className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 w-80 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TestTube className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">API Status</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 text-sm">World Bank API</span>
          </div>
          {getStatusIcon(testResults?.['World Bank'])}
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-green-400" />
            <span className="text-slate-300 text-sm">REST Countries API</span>
          </div>
          {getStatusIcon(testResults?.['REST Countries'])}
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 text-sm">OpenAQ API</span>
          </div>
          {getStatusIcon(testResults?.['OpenAQ'])}
        </div>
      </div>

      <button
        onClick={runAPITests}
        disabled={testing}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
        <div className="mt-3 text-xs text-slate-400">
          Last tested: {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}