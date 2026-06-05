import React from 'react';
import { X } from 'lucide-react';
import QuoteForm from './QuoteForm';

export default function QuoteModal({ quote, onClose, initialLeadId }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-card border border-surface-border rounded-2xl w-full max-w-4xl shadow-card animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border sticky top-0 bg-surface-card/95 backdrop-blur-sm">
          <div>
            <h2 className="text-lg font-bold text-white">
              {quote ? 'Edit Quotation' : 'Create New Quotation'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {quote ? 'Update quotation details' : 'Fill in the details to create a new quotation'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-xl text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        {/* Form */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6">
            <QuoteForm quote={quote} onClose={onClose} initialLeadId={initialLeadId} />
          </div>
        </div>
      </div>
    </div>
  );
}
