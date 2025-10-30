import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white/70 backdrop-blur-xl border border-[#3a5a40]/20 rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl text-[#1b4332]">
        <div className="relative mb-4">
          <Loader2 className="h-12 w-12 text-[#40916c] animate-spin" />
          <div className="absolute inset-0 h-12 w-12 border-2 border-[#b7e4c7]/60 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold mb-2">{message}</div>
        </div>
        <div className="flex space-x-2 mt-2">
          <div className="w-2 h-2 bg-[#40916c] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#40916c] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#40916c] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}