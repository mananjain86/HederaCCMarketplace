import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export function Toast({ message, type = 'info', duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-[#1b4332]" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <AlertCircle className="h-5 w-5 text-[#40916c]" />,
  };

  const colors = {
    success: 'bg-white/70 border-[#3a5a40]/20 text-[#1b4332]',
    error: 'bg-white/70 border-red-200 text-red-600',
    warning: 'bg-white/70 border-yellow-200 text-yellow-700',
    info: 'bg-white/70 border-[#40916c]/20 text-[#1b4332]',
  };

  return (
    <div
      className={`max-w-sm w-full border backdrop-blur-xl rounded-2xl shadow-xl transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } ${colors[type]}`}
      style={{ boxShadow: '0 8px 32px 0 rgba(16, 40, 32, 0.12)' }}
    >
      <div className="p-4 flex items-start space-x-3">
        {icons[type]}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1b4332]">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-[#3a5a40]/60 hover:text-[#1b4332] focus:text-[#1b4332] transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-[#40916c]"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-6 right-6 z-50 space-y-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}