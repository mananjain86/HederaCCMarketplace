import React from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';

export function SuccessMessage({ message, transactionHash, onClose }) {
  return (
    <div className="bg-emerald-900/50 border border-emerald-500 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-emerald-300 font-medium mb-1">Success!</h4>
          <p className="text-emerald-100 text-sm mb-2">{message}</p>
          {transactionHash && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-emerald-300">Transaction:</span>
              <a 
                href={`https://etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
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
            className="text-emerald-400 hover:text-emerald-300"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        )}
      </div>
    </div>
  );
}