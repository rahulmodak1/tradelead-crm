import React from 'react';
import { ChevronRight, MoreVertical, Copy, Mail, CheckCircle2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuoteStatusBadge from './QuoteStatusBadge';

export default function QuoteTable({
  quotations = [],
  loading = false,
  onEdit,
  onDuplicate,
  onSend,
  onConvert,
  onDelete,
  onStatusChange,
}) {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = React.useState(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-8 text-center">
        <p className="text-gray-400">No quotations found</p>
      </div>
    );
  }

  return (
    <div className="border border-surface-border rounded-xl overflow-hidden bg-surface-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-border bg-surface-hover">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Quote #</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Valid Until</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((quote) => (
            <tr key={quote._id} className="border-b border-surface-border hover:bg-surface-hover transition-colors table-row-hover">
              <td
                className="px-6 py-4 text-sm font-semibold text-brand-400 cursor-pointer hover:text-brand-300 transition-colors"
                onClick={() => navigate(`/quotes/${quote._id}`)}
              >
                <div className="flex items-center gap-2">
                  {quote.quoteNumber}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-300">
                {quote.customer?.name || 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-100">
                ₹{(quote.total || 0).toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4">
                <QuoteStatusBadge status={quote.status} />
              </td>
              <td className="px-6 py-4 text-sm text-gray-400">
                {quote.validUntil
                  ? new Date(quote.validUntil).toLocaleDateString('en-IN')
                  : 'N/A'}
              </td>
              <td className="px-6 py-4 relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === quote._id ? null : quote._id)}
                  className="p-2 hover:bg-surface-hover rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
                  title="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {openMenuId === quote._id && (
                  <div className="absolute right-0 top-full mt-1 bg-surface-card border border-surface-border shadow-card rounded-xl z-10 min-w-[180px] overflow-hidden">
                    <button
                      onClick={() => {
                        navigate(`/quotes/${quote._id}`);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-surface-hover text-sm text-gray-300 hover:text-gray-100 transition-colors"
                    >
                      View Details
                    </button>
                    {quote.status !== 'Converted' && quote.status !== 'Rejected' && (
                      <>
                        <button
                          onClick={() => {
                            onEdit?.(quote);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-surface-hover text-sm text-gray-300 hover:text-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onSend?.(quote);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-surface-hover text-sm text-gray-300 hover:text-gray-100 transition-colors flex items-center gap-2"
                        >
                          <Mail className="w-3 h-3" /> Send
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        onDuplicate?.(quote);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-surface-hover text-sm text-gray-300 hover:text-gray-100 transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-3 h-3" /> Duplicate
                    </button>
                    {quote.status === 'Approved' && (
                      <button
                        onClick={() => {
                          onConvert?.(quote);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-surface-hover text-sm text-gray-300 hover:text-gray-100 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Convert
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onDelete?.(quote);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-sm flex items-center gap-2 transition-colors border-t border-surface-border"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
