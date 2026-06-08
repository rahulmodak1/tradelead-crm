/**
 * useQuotes.jsx
 * Manages quotation list state: fetch, create, delete, status change.
 * Keeps all API knowledge inside the hook — QuotesPage is UI-only.
 */
import { useState, useEffect, useCallback } from 'react';
import quotesService from '../utils/quotesService';

const useQuotes = () => {
  // ─── List state ────────────────────────────────────────────────────────────
  const [quotations, setQuotations]   = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // ─── Filter / pagination state ─────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState('');   // '' = All
  const [page, setPage]                 = useState(1);
  const LIMIT = 20;

  // ─── Modal state ───────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState(null);

  // ─── Toast state ──────────────────────────────────────────────────────────
  const [toast, setToast]             = useState(null); // { type, message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quotesService.getAll({
        ...(statusFilter ? { status: statusFilter } : {}),
        page,
        limit: LIMIT,
      });
      setQuotations(data.quotations ?? data);
      setTotal(data.total ?? (data.quotations ?? data).length);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to load quotations';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // ─── Create ────────────────────────────────────────────────────────────────
  /**
   * @param {{ lead: string, items: object[], notes?: string }} formData
   */
  const createQuotation = async (formData) => {
    setSaving(true);
    setSaveError(null);
    try {
      await quotesService.create(formData);
      setModalOpen(false);
      showToast('success', 'Quotation created successfully');
      // Reset to page 1 so the new quote appears at the top
      if (page !== 1) setPage(1);
      else fetchQuotations();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to create quotation';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const deleteQuotation = async (id) => {
    if (!window.confirm('Delete this quotation? This cannot be undone.')) return;
    try {
      await quotesService.remove(id);
      showToast('success', 'Quotation deleted');
      fetchQuotations();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete';
      showToast('error', msg);
    }
  };

  // ─── Status change ─────────────────────────────────────────────────────────
  const changeStatus = async (id, status) => {
    try {
      const updated = await quotesService.updateStatus(id, status);
      setQuotations((prev) =>
        prev.map((q) => (q._id === id ? { ...q, status: updated.status } : q))
      );
      showToast('success', `Status updated to ${status}`);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update status';
      showToast('error', msg);
    }
  };

  // ─── Modal helpers ─────────────────────────────────────────────────────────
  const openModal  = () => { setSaveError(null); setModalOpen(true); };
  const closeModal = () => { setSaveError(null); setModalOpen(false); };

  return {
    // list
    quotations,
    total,
    loading,
    error,
    refetch: fetchQuotations,

    // filters
    statusFilter, setStatusFilter,
    page, setPage,
    totalPages: Math.ceil(total / LIMIT),

    // actions
    createQuotation,
    deleteQuotation,
    changeStatus,

    // modal
    modalOpen,
    openModal,
    closeModal,
    saving,
    saveError,

    // toast
    toast,
  };
};

export default useQuotes;
