import React from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';

export function SuccessMessage({ message, transactionHash, onClose }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-[#3a5a40]/20 rounded-2xl p-6 mb-6 shadow-2xl text-[#1b4332]">
      <div className="flex items-start space-x-3">
        <CheckCircle className="h-6 w-6 text-[#40916c] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-[#40916c] font-bold mb-1">Success!</h4>
          <p className="text-[#1b4332] text-sm mb-2 font-semibold">{message}</p>
          {transactionHash && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#3a5a40]/70">Transaction:</span>
              <a 
                href={`https://etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#40916c] hover:text-[#1b4332] flex items-center space-x-1 font-mono"
              >
                <span>{transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-[#40916c] hover:text-[#1b4332] text-xl font-bold px-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#40916c]"
            aria-label="Close success message"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}