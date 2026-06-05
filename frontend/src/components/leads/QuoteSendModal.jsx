import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useQuotes } from '../../hooks/useQuotes';

export default function QuoteSendModal({ quote, onClose }) {
  const { sendQuotation, showToast } = useQuotes();
  const [toEmail, setToEmail] = useState(quote?.customer?.email || '');
  const [message, setMessage] = useState('');
  const [sendAsPdf, setSendAsPdf] = useState(true);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!toEmail) {
      showToast('Email is required', 'error');
      return;
    }

    setSending(true);
    try {
      await sendQuotation(quote._id, { toEmail, message, sendAsPdf });
      onClose();
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-card border border-surface-border rounded-2xl w-full max-w-md shadow-card animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b border-surface-border">
          <div>
            <h2 className="text-lg font-bold text-white">Send Quotation</h2>
            <p className="text-xs text-gray-500 mt-0.5">Share via email</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-xl text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              className="input-field"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field resize-none"
              rows="4"
              placeholder="Add a personal message..."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="sendPdf"
              checked={sendAsPdf}
              onChange={(e) => setSendAsPdf(e.target.checked)}
              className="w-4 h-4 accent-brand-500 cursor-pointer"
            />
            <span className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors">
              Send as PDF
            </span>
          </label>

          <div className="flex gap-3 pt-4 border-t border-surface-border">
            <button
              onClick={onClose}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
