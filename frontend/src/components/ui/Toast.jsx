import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  const isSuccess = type === 'success';

  return (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-[60] flex items-start gap-3 max-w-sm px-4 py-3 rounded-xl border shadow-card animate-fade-in
        bg-surface-card border-surface-border"
    >
      {isSuccess ? (
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
      )}
      <p className={`text-sm flex-1 ${isSuccess ? 'text-emerald-300' : 'text-red-300'}`}>
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="p-0.5 rounded-md text-gray-500 hover:text-gray-300 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
