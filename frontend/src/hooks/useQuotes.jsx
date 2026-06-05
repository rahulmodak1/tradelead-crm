import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import Toast from '../components/ui/Toast';
import { quotesService } from '../utils/quotesService';
import { useAuth } from './useAuth';

export const QUOTATION_STATUSES = ['Draft', 'Sent', 'Viewed', 'Negotiation', 'Approved', 'Rejected', 'Converted'];

const QuotesContext = createContext(null);

function useQuotesState() {
  const { isAuthenticated } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leadFilter, setLeadFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusToast, setStatusToast] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const fetchQuotations = useCallback(
    async ({ silent = false } = {}) => {
      if (!isAuthenticated) {
        setQuotations([]);
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);
      setError(null);

      try {
        const params = {
          page,
          limit,
          ...(statusFilter !== 'All' && { status: statusFilter }),
          ...(leadFilter !== 'All' && { leadId: leadFilter }),
          ...(assigneeFilter !== 'All' && { assignedTo: assigneeFilter }),
          ...(searchQuery && { search: searchQuery }),
        };

        const data = await quotesService.listQuotations(params);
        setQuotations(Array.isArray(data.data) ? data.data : []);
        if (data.total) setTotal(data.total);
      } catch (err) {
        setError(err.message || 'Failed to fetch quotations');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [isAuthenticated, page, limit, statusFilter, leadFilter, assigneeFilter, searchQuery]
  );

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  useEffect(() => {
    if (!statusToast) return;
    const timer = setTimeout(() => setStatusToast(null), 3000);
    return () => clearTimeout(timer);
  }, [statusToast]);

  const filteredQuotations = useMemo(() => {
    let filtered = [...quotations];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.quoteNumber?.toLowerCase().includes(lowerQuery) ||
          q.customer?.name?.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [quotations, searchQuery, sortConfig]);

  const statusCounts = useMemo(() => {
    const counts = {};
    QUOTATION_STATUSES.forEach((s) => {
      counts[s] = quotations.filter((q) => q.status === s).length;
    });
    return counts;
  }, [quotations]);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const addQuotation = useCallback(
    async (quotationData) => {
      try {
        const newQuotation = await quotesService.createQuotation(quotationData);
        setQuotations((prev) => [newQuotation, ...prev]);
        setStatusToast({ type: 'success', message: `Quotation ${newQuotation.quoteNumber} created` });
        return newQuotation;
      } catch (err) {
        setStatusToast({ type: 'error', message: err.message || 'Failed to create quotation' });
        throw err;
      }
    },
    []
  );

  const updateQuotation = useCallback(
    async (id, updates) => {
      try {
        const updated = await quotesService.updateQuotation(id, updates);
        setQuotations((prev) => prev.map((q) => (q._id === id ? updated : q)));
        setStatusToast({ type: 'success', message: 'Quotation updated' });
        return updated;
      } catch (err) {
        setStatusToast({ type: 'error', message: err.message || 'Failed to update quotation' });
        throw err;
      }
    },
    []
  );

  const updateQuotationStatus = useCallback(
    async (id, newStatus) => {
      try {
        const updated = await quotesService.updateStatus(id, newStatus);
        setQuotations((prev) => prev.map((q) => (q._id === id ? updated : q)));
        setStatusToast({ type: 'success', message: `Status changed to ${newStatus}` });
        return updated;
      } catch (err) {
        setStatusToast({ type: 'error', message: err.message || 'Failed to update status' });
        throw err;
      }
    },
    []
  );

  const deleteQuotation = useCallback(
    async (id) => {
      try {
        await quotesService.deleteQuotation(id);
        setQuotations((prev) => prev.filter((q) => q._id !== id));
        setStatusToast({ type: 'success', message: 'Quotation deleted' });
      } catch (err) {
        setStatusToast({ type: 'error', message: err.message || 'Failed to delete quotation' });
        throw err;
      }
    },
    []
  );

  const duplicateQuotation = useCallback(
    async (id) => {
      try {
        const duplicate = await quotesService.duplicateQuotation(id);
        setQuotations((prev) => [duplicate, ...prev]);
        setStatusToast({ type: 'success', message: `Quotation duplicated as ${duplicate.quoteNumber}` });
        return duplicate;
      } catch (err) {
        setStatusToast({ type: 'error', message: err.message || 'Failed to duplicate quotation' });
        throw err;
      }
    },
    []
  );

  const convertQuotation = useCallback(
    async (id, options = {}) => {
      try {
        const converted = await quotesService.convertQuotation(id, options);
        setQuotations((prev) => prev.map((q) => (q._id === id ? converted : q)));
        setStatusToast({ type: 'success', message: 'Quotation converted' });
        return converted;
      } catch (err) {
        setStatusToast({ type: 'error', message: err.message || 'Failed to convert quotation' });
        throw err;
      }
    },
    []
  );

  const sendQuotation = useCallback(
    async (id, data) => {
      try {
        const sent = await quotesService.sendQuotation(id, data);
        setQuotations((prev) => prev.map((q) => (q._id === id ? sent : q)));
        setStatusToast({ type: 'success', message: 'Quotation sent' });
        return sent;
      } catch (err) {
        setStatusToast({ type: 'error', message: err.message || 'Failed to send quotation' });
        throw err;
      }
    },
    []
  );

  const addNote = useCallback(
    async (id, text) => {
      try {
        const note = await quotesService.addNote(id, text);
        setQuotations((prev) =>
          prev.map((q) =>
            q._id === id
              ? { ...q, notes: [...(q.notes || []), note] }
              : q
          )
        );
        setStatusToast({ type: 'success', message: 'Note added' });
        return note;
      } catch (err) {
        setStatusToast({ type: 'error', message: err.message || 'Failed to add note' });
        throw err;
      }
    },
    []
  );

  const refetch = useCallback(() => fetchQuotations({ silent: true }), [fetchQuotations]);

  const showToast = useCallback((message, type = 'info') => {
    setStatusToast({ type, message });
  }, []);

  return {
    quotations,
    filteredQuotations,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    leadFilter,
    setLeadFilter,
    assigneeFilter,
    setAssigneeFilter,
    sortConfig,
    handleSort,
    page,
    setPage,
    limit,
    setLimit,
    total,
    statusCounts,
    statusToast,
    showToast,
    selectedQuotation,
    setSelectedQuotation,
    addQuotation,
    updateQuotation,
    updateQuotationStatus,
    deleteQuotation,
    duplicateQuotation,
    convertQuotation,
    sendQuotation,
    addNote,
    refetch,
  };
}

export function QuotesProvider({ children }) {
  const state = useQuotesState();
  return (
    <QuotesContext.Provider value={state}>
      {children}
      {state.statusToast && (
        <Toast
          message={state.statusToast.message}
          type={state.statusToast.type}
          onClose={() => state.showToast(null)}
        />
      )}
    </QuotesContext.Provider>
  );
}

export function useQuotes() {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error('useQuotes must be used within QuotesProvider');
  }
  return context;
}
