import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Mail, Copy, CheckCircle2, Trash2, MessageSquare, Plus, Printer } from 'lucide-react';
import { quotesService } from '../utils/quotesService';
import { useQuotes } from '../hooks/useQuotes';
import QuoteStatusBadge from '../components/leads/QuoteStatusBadge';
import QuoteSendModal from '../components/leads/QuoteSendModal';
import QuoteModal from '../components/leads/QuoteModal';
import QuotePrint from '../components/leads/QuotePrint';

const QuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { duplicateQuotation, convertQuotation, deleteQuotation, addNote, showToast } = useQuotes();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        const data = await quotesService.getQuotation(id);
        setQuote(data);
      } catch (err) {
        setError(err.message || 'Failed to load quotation');
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/quotes')}
          className="flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Quotations
        </button>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          {error || 'Quotation not found'}
        </div>
      </div>
    );
  }

  const handleDuplicate = async () => {
    if (window.confirm(`Duplicate quotation ${quote.quoteNumber}?`)) {
      try {
        await duplicateQuotation(id);
        showToast('Quotation duplicated successfully', 'success');
      } catch (err) {
        console.error('Failed:', err);
      }
    }
  };

  const handleConvert = async () => {
    if (window.confirm(`Convert ${quote.quoteNumber} to order?`)) {
      try {
        await convertQuotation(id);
        showToast('Quotation converted', 'success');
        setTimeout(() => navigate('/quotes'), 1500);
      } catch (err) {
        console.error('Failed:', err);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete quotation ${quote.quoteNumber}?`)) {
      try {
        await deleteQuotation(id);
        showToast('Quotation deleted', 'success');
        setTimeout(() => navigate('/quotes'), 1500);
      } catch (err) {
        console.error('Failed:', err);
      }
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      await addNote(id, noteText);
      const updated = await quotesService.getQuotation(id);
      setQuote(updated);
      setNoteText('');
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const lineTotal = quote.items?.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    const gst = (lineSubtotal * item.gstPercent) / 100;
    return sum + lineSubtotal + gst - item.discount;
  }, 0) || 0;

  return (
    <div className="space-y-6 pb-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/quotes')}
            className="p-2 hover:bg-surface-hover rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
            title="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{quote.quoteNumber}</h1>
            <p className="text-gray-400 mt-1">{quote.title || quote.customer?.name}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {['Draft', 'Negotiation'].includes(quote.status) && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-ghost"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => setShowSendModal(true)}
                className="btn-primary"
              >
                <Mail size={16} />
                Send
              </button>
            </>
          )}
          <button
            onClick={() => setShowPrintModal(true)}
            className="btn-ghost"
          >
            <Printer size={16} />
            Print/PDF
          </button>
          <button
            onClick={handleDuplicate}
            className="btn-ghost"
          >
            <Copy size={16} />
            Duplicate
          </button>
          {quote.status === 'Approved' && (
            <button
              onClick={handleConvert}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm shadow-glow"
            >
              <CheckCircle2 size={16} />
              Convert
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors text-sm"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-6 grid grid-cols-4 gap-4">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Status</span>
          <div className="mt-2">
            <QuoteStatusBadge status={quote.status} />
          </div>
        </div>
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Created</span>
          <p className="text-gray-100 font-semibold mt-1">
            {new Date(quote.createdAt).toLocaleDateString('en-IN')}
          </p>
        </div>
        {quote.validUntil && (
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Valid Until</span>
            <p className="text-gray-100 font-semibold mt-1">
              {new Date(quote.validUntil).toLocaleDateString('en-IN')}
            </p>
          </div>
        )}
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total</span>
          <p className="text-brand-400 font-bold text-lg mt-1">₹{(quote.total || lineTotal).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="text-gray-100 font-semibold mt-1">{quote.customer?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Company</p>
                <p className="text-gray-100 font-semibold mt-1">{quote.customer?.companyName}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="text-gray-100 font-semibold mt-1">{quote.customer?.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="text-gray-100 font-semibold mt-1">{quote.customer?.email}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-6 overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide mb-4">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-hover">
                    <th className="px-4 py-3 text-left text-gray-400 font-semibold">Product</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-semibold">Material</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-semibold">Unit Price</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items?.map((item, idx) => {
                    const itemTotal = item.quantity * item.unitPrice + (item.quantity * item.unitPrice * item.gstPercent) / 100 - item.discount;
                    return (
                      <tr key={idx} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                        <td className="px-4 py-3 text-gray-300">{item.productName}</td>
                        <td className="px-4 py-3 text-gray-400">{item.category}</td>
                        <td className="px-4 py-3 text-gray-400">{item.material}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-300">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-brand-400 font-semibold">₹{itemTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Requirements */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide mb-4">Customer Requirements</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Delivery Location</p>
                <p className="text-gray-100 font-semibold mt-1">{quote.deliveryLocation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Delivery Date</p>
                <p className="text-gray-100 font-semibold mt-1">
                  {quote.deliveryDate ? new Date(quote.deliveryDate).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Sample Required</p>
                <p className="text-gray-100 font-semibold mt-1">{quote.sampleRequired ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-gray-500">Artwork Available</p>
                <p className="text-gray-100 font-semibold mt-1">{quote.artworkAvailable ? 'Yes' : 'No'}</p>
              </div>
            </div>
            {quote.remarks && (
              <div className="mt-4 pt-4 border-t border-surface-border">
                <p className="text-gray-500 text-sm">Remarks</p>
                <p className="text-gray-100 font-semibold mt-1">{quote.remarks}</p>
              </div>
            )}
          </div>

          {/* History */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide mb-4">Activity History</h3>
            <div className="space-y-2 text-xs">
              {quote.history?.length > 0 ? (
                quote.history.map((entry, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2.5 border-b border-surface-border last:border-0">
                    <span className="capitalize text-gray-400">{entry.action}</span>
                    <span className="text-gray-500">
                      {new Date(entry.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No history</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Totals */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide mb-4">Summary</h3>
            <div className="flex justify-between text-sm text-gray-300">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-100 font-medium">₹{(quote.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span className="text-gray-500">GST</span>
              <span className="text-gray-100 font-medium">₹{(quote.taxTotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span className="text-gray-500">Discount</span>
              <span className="text-gray-100 font-medium">₹{(quote.discountTotal || 0).toFixed(2)}</span>
            </div>
            <div className="border-t border-surface-border pt-3 flex justify-between font-bold text-brand-400">
              <span>Total</span>
              <span className="text-lg">₹{(quote.total || lineTotal).toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide mb-4 flex items-center gap-2">
              <MessageSquare size={16} />
              Notes
            </h3>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {quote.notes?.length > 0 ? (
                quote.notes.map((note, idx) => (
                  <div key={idx} className="bg-surface-hover border border-surface-border p-3 rounded-lg text-xs">
                    <p className="font-semibold text-gray-400">
                      {note.author?.name || 'Unknown'} - {new Date(note.createdAt).toLocaleString('en-IN')}
                    </p>
                    <p className="mt-2 text-gray-300">{note.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No notes</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="input-field text-sm flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                disabled={addingNote || !noteText.trim()}
                className="btn-primary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add note"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSendModal && (
        <QuoteSendModal quote={quote} onClose={() => setShowSendModal(false)} />
      )}
      {showEditModal && (
        <QuoteModal quote={quote} onClose={() => setShowEditModal(false)} />
      )}
      {showPrintModal && (
        <QuotePrint quote={quote} onClose={() => setShowPrintModal(false)} />
      )}
    </div>
  );
};

export default QuoteDetailPage;
