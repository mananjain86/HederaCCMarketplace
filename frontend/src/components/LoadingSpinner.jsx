import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
          <div className="absolute inset-0 h-12 w-12 border-2 border-emerald-400/20 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center">
          <div className="text-lg font-medium text-white mb-2">{message}</div>
        </div>
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}