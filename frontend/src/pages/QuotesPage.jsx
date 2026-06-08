/**
 * QuotesPage.jsx
 * Quotation list + inline create modal.
 *
 * Assumptions that match your existing project:
 *  - Tailwind CSS is configured
 *  - lucide-react is installed  (already used in Sidebar/Navbar)
 *  - /api/leads  GET returns { leads: [...] } or plain array
 *    (used to populate the Lead dropdown in the create modal)
 *  - Auth token is injected by the axios instance — no extra work needed here
 */
import { useState, useEffect } from 'react';
import {
  Plus, RefreshCw, X, AlertTriangle,
  FileText, ChevronLeft, ChevronRight,
  Trash2, ChevronDown,
} from 'lucide-react';
import useQuotes from '../hooks/useQuotes';
import api from '../utils/api'; // same instance used everywhere

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];

const STATUS_STYLES = {
  Draft:    'bg-gray-100 text-gray-700 border-gray-200',
  Sent:     'bg-blue-50 text-blue-700 border-blue-200',
  Accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
  Expired:  'bg-amber-50 text-amber-700 border-amber-200',
};

const CATEGORIES = [
  'Fabric', 'Steel', 'Chemicals', 'Electronics',
  'Machinery', 'Packaging', 'Furniture', 'Spices',
  'Auto Parts', 'Pharma', 'Construction', 'Other',
];

const BLANK_ITEM = { category: '', description: '', quantity: '', unitPrice: '', gstPercent: 18 };

const fmt = {
  currency: (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0),
  date: (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
        ${isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
    >
      {isError
        ? <AlertTriangle size={16} className="shrink-0" />
        : <span className="text-emerald-500 shrink-0">✓</span>}
      {toast.message}
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[status] ?? STATUS_STYLES.Draft}`}>
    {status}
  </span>
);

// ─── Status Dropdown ─────────────────────────────────────────────────────────
const StatusSelect = ({ current, quoteId, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 focus:outline-none"
      >
        <StatusBadge status={current} />
        <ChevronDown size={12} className="text-gray-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-36">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { onChange(quoteId, s); setOpen(false); }}
                disabled={s === current}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors
                  ${s === current ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Line Item Row ─────────────────────────────────────────────────────────────
const ItemRow = ({ item, index, onChange, onRemove, isOnly }) => {
  const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  const gst       = (lineTotal * (Number(item.gstPercent) || 0)) / 100;

  return (
    <div className="grid grid-cols-12 gap-2 items-start bg-gray-50 border border-gray-200 rounded-xl p-3">
      {/* Category */}
      <div className="col-span-12 sm:col-span-3">
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
          Category *
        </label>
        <select
          value={item.category}
          onChange={(e) => onChange(index, 'category', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400"
          required
        >
          <option value="">Select…</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Description */}
      <div className="col-span-12 sm:col-span-3">
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
          Description *
        </label>
        <input
          type="text"
          value={item.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          placeholder="Product / service detail"
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400"
          required
        />
      </div>

      {/* Qty */}
      <div className="col-span-4 sm:col-span-1">
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
          Qty *
        </label>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onChange(index, 'quantity', e.target.value)}
          min="0.001"
          step="any"
          placeholder="0"
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400"
          required
        />
      </div>

      {/* Unit Price */}
      <div className="col-span-4 sm:col-span-2">
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
          Unit Price ₹ *
        </label>
        <input
          type="number"
          value={item.unitPrice}
          onChange={(e) => onChange(index, 'unitPrice', e.target.value)}
          min="0"
          step="any"
          placeholder="0"
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400"
          required
        />
      </div>

      {/* GST % */}
      <div className="col-span-4 sm:col-span-1">
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
          GST %
        </label>
        <select
          value={item.gstPercent}
          onChange={(e) => onChange(index, 'gstPercent', Number(e.target.value))}
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400"
        >
          {[0, 5, 12, 18, 28].map((g) => <option key={g} value={g}>{g}%</option>)}
        </select>
      </div>

      {/* Line total */}
      <div className="col-span-10 sm:col-span-1">
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
          Total
        </label>
        <p className="text-sm font-semibold text-gray-700 pt-1.5">
          {fmt.currency(lineTotal + gst)}
        </p>
      </div>

      {/* Remove */}
      <div className="col-span-2 sm:col-span-1 flex items-end justify-end pb-0.5">
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={isOnly}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          title="Remove item"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── Create Modal ─────────────────────────────────────────────────────────────
const CreateModal = ({ onClose, onSave, saving, saveError }) => {
  const [leads, setLeads]       = useState([]);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState('');
  const [items, setItems]       = useState([{ ...BLANK_ITEM }]);
  const [notes, setNotes]       = useState('');
  const [formError, setFormError] = useState('');

  // Fetch leads for dropdown
  useEffect(() => {
    api.get('/leads', { params: { limit: 200 } })
      .then((r) => {
        const data = r.data;
        setLeads(Array.isArray(data) ? data : (data.leads ?? []));
      })
      .catch(() => setLeads([]))
      .finally(() => setLeadsLoading(false));
  }, []);

  const filteredLeads = leads.filter((l) => {
    const q = leadSearch.toLowerCase();
    return !q
      || l.customerName?.toLowerCase().includes(q)
      || l.company?.toLowerCase().includes(q);
  });

  // Item helpers
  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };
  const addItem    = () => setItems((prev) => [...prev, { ...BLANK_ITEM }]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  // Totals preview
  const subtotal   = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const totalGst   = items.reduce((s, it) => {
    const lt = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
    return s + (lt * (Number(it.gstPercent) || 0)) / 100;
  }, 0);
  const grandTotal = subtotal + totalGst;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedLead) { setFormError('Please select a lead.'); return; }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.category)                  { setFormError(`Item ${i + 1}: category is required.`); return; }
      if (!it.description.trim())        { setFormError(`Item ${i + 1}: description is required.`); return; }
      if (!(Number(it.quantity) > 0))    { setFormError(`Item ${i + 1}: quantity must be > 0.`); return; }
      if (Number(it.unitPrice) < 0)      { setFormError(`Item ${i + 1}: unit price cannot be negative.`); return; }
    }

    // Build clean payload — field names must match backend schema exactly
    const payload = {
      lead: selectedLead,
      notes,
      items: items.map((it) => ({
        category:    it.category,           // ← the critical field
        description: it.description.trim(),
        quantity:    Number(it.quantity),
        unitPrice:   Number(it.unitPrice),
        gstPercent:  Number(it.gstPercent),
      })),
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">New Quotation</h2>
            <p className="text-xs text-gray-400 mt-0.5">Quote number assigned automatically</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Lead selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Lead *
            </label>
            <input
              type="text"
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              placeholder="Search leads by name or company…"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400 mb-2"
            />
            {leadsLoading ? (
              <p className="text-xs text-gray-400">Loading leads…</p>
            ) : (
              <select
                size={Math.min(5, filteredLeads.length + 1)}
                value={selectedLead}
                onChange={(e) => setSelectedLead(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400"
                required
              >
                <option value="">— select a lead —</option>
                {filteredLeads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.customerName}{l.company ? ` · ${l.company}` : ''}{l.city ? ` · ${l.city}` : ''}
                  </option>
                ))}
              </select>
            )}
            {!leadsLoading && filteredLeads.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">No leads found. Add leads first.</p>
            )}
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Line Items *
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus size={13} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <ItemRow
                  key={i}
                  index={i}
                  item={item}
                  onChange={updateItem}
                  onRemove={removeItem}
                  isOnly={items.length === 1}
                />
              ))}
            </div>
          </div>

          {/* Totals preview */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm space-y-1.5">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal (ex-GST)</span>
              <span className="font-medium text-gray-700">{fmt.currency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>GST</span>
              <span className="font-medium text-gray-700">{fmt.currency(totalGst)}</span>
            </div>
            <div className="flex justify-between text-gray-900 font-semibold border-t border-gray-200 pt-1.5 mt-1.5">
              <span>Grand Total</span>
              <span className="text-blue-700">{fmt.currency(grandTotal)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Terms, delivery notes, etc."
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-400 resize-none"
            />
          </div>

          {/* Errors */}
          {(formError || saveError) && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{formError || saveError}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={(e) => {
              // Trigger the form inside the scrollable area
              e.currentTarget.closest('.fixed').querySelector('form').requestSubmit();
            }}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus size={14} />
                Create Quotation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilter, onClear, onAdd }) => (
  <tr>
    <td colSpan={6} className="py-20 text-center">
      <FileText size={36} className="mx-auto text-gray-300 mb-3" />
      <p className="text-sm font-semibold text-gray-500">
        {hasFilter ? 'No quotations match this filter' : 'No quotations yet'}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {hasFilter
          ? <button onClick={onClear} className="text-blue-500 hover:underline">Clear filter</button>
          : <button onClick={onAdd}   className="text-blue-500 hover:underline">Create your first quotation</button>}
      </p>
    </td>
  </tr>
);

// ─── QuotesPage ───────────────────────────────────────────────────────────────
const QuotesPage = () => {
  const {
    quotations, total, loading, error, refetch,
    statusFilter, setStatusFilter,
    page, setPage, totalPages,
    createQuotation, deleteQuotation, changeStatus,
    modalOpen, openModal, closeModal,
    saving, saveError,
    toast,
  } = useQuotes();

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Toast */}
      <Toast toast={toast} />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading…' : `${total} quotation${total !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus size={15} strokeWidth={2.5} />
            Create Quotation
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s || 'All'}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all
              ${statusFilter === s
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={15} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={refetch} className="text-xs underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Quote No.', 'Customer', 'Lead', 'Status', 'Grand Total', 'Date', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3" />
                    <p className="text-sm text-gray-400">Loading quotations…</p>
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <EmptyState
                  hasFilter={!!statusFilter}
                  onClear={() => setStatusFilter('')}
                  onAdd={openModal}
                />
              ) : (
                quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-gray-50 transition-colors group">
                    {/* Quote number */}
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-blue-700">
                      {q.quoteNumber || '—'}
                    </td>

                    {/* Customer snapshot */}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-800 leading-tight">
                        {q.customer?.name || q.lead?.customerName || '—'}
                      </p>
                      <p className="text-xs text-gray-400 leading-tight mt-0.5">
                        {q.customer?.company || q.lead?.company || ''}
                      </p>
                    </td>

                    {/* Lead company */}
                    <td className="px-4 py-3.5 text-gray-500 text-xs">
                      {q.lead?.city || '—'}
                    </td>

                    {/* Status — click to change */}
                    <td className="px-4 py-3.5">
                      <StatusSelect
                        current={q.status}
                        quoteId={q._id}
                        onChange={changeStatus}
                      />
                    </td>

                    {/* Grand total */}
                    <td className="px-4 py-3.5 font-semibold text-gray-800">
                      {fmt.currency(q.grandTotal)}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      {fmt.date(q.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => deleteQuotation(q._id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Delete quotation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {modalOpen && (
        <CreateModal
          onClose={closeModal}
          onSave={createQuotation}
          saving={saving}
          saveError={saveError}
        />
      )}
    </div>
  );
};

export default QuotesPage;
