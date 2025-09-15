import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorMessage({ message }) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Data Loading Error</h3>
        <p className="text-red-300 mb-6">{message}</p>
        <button
          onClick={handleRefresh}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Loading</span>
        </button>
        <div className="mt-4 text-slate-400 text-sm">
          The system will attempt to use fallback data if available
        </div>
      </div>
    </div>
  );
}