import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorMessage({ message }) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white/70 backdrop-blur-xl border border-[#3a5a40]/20 rounded-2xl p-8 text-center shadow-2xl text-[#1b4332]">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-extrabold mb-2 text-[#1b4332]">Data Loading Error</h3>
        <p className="text-red-500 mb-6 font-semibold">{message}</p>
        <button
          onClick={handleRefresh}
          className="bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white px-6 py-3 rounded-full font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all flex items-center space-x-2 mx-auto shadow-lg"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Loading</span>
        </button>
        <div className="mt-4 text-[#3a5a40]/60 text-sm">
          The system will attempt to use fallback data if available
        </div>
      </div>
    </div>
  );
}