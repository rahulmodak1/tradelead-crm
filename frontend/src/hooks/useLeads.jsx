import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import Toast from '../components/ui/Toast';
import { apiFetch, apiJson } from '../utils/apiClient';
import { useAuth } from './useAuth';

export const LEAD_STATUSES = ['New', 'Hot', 'Follow Up', 'Closed'];

const LeadsContext = createContext(null);

function useLeadsState() {
  const { isAuthenticated } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [statusToast, setStatusToast] = useState(null);

  const fetchLeads = useCallback(async ({ silent = false } = {}) => {
    if (!isAuthenticated) {
      setLeads([]);
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await apiJson('/leads');
      setLeads(Array.isArray(data) ? data : (data.leads || data.data || []));
    } catch (err) {
      setError(err.message || 'Failed to fetch leads');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    if (!syncMessage) return;
    const timer = setTimeout(() => setSyncMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [syncMessage]);

  useEffect(() => {
    if (!statusToast) return;
    const timer = setTimeout(() => setStatusToast(null), 4000);
    return () => clearTimeout(timer);
  }, [statusToast]);

  const addLead = useCallback(async (payload) => {
    const lead = await apiJson('/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await fetchLeads();
    return lead;
  }, [fetchLeads]);

  const updateLead = useCallback(async (id, payload) => {
    await apiJson(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    await fetchLeads();
  }, [fetchLeads]);

  const updateLeadStatus = useCallback(async (id, status) => {
    const leadId = String(id);
    try {
      await apiJson(`/leads/${leadId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await fetchLeads({ silent: true });
      setStatusToast({
        type: 'success',
        message: `Lead status updated to "${status}"`,
      });
    } catch (err) {
      setStatusToast({
        type: 'error',
        message: err.message || 'Failed to update lead status',
      });
      throw err;
    }
  }, [fetchLeads]);

  const deleteLead = useCallback(async (id) => {
    const res = await apiFetch(`/leads/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    setLeads(prev => prev.filter(l => (l._id || l.id) !== id));
  }, []);

  const fetchLeadById = useCallback(async (id) => {
    const lead = await apiJson(`/leads/${id}`);
    setLeads(prev => {
      const idx = prev.findIndex(l => (l._id || l.id) === id);
      if (idx === -1) return [...prev, lead];
      const next = [...prev];
      next[idx] = lead;
      return next;
    });
    return lead;
  }, []);

  const addNote = useCallback(async (id, text) => {
    const lead = await apiJson(`/leads/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    setLeads(prev => prev.map(l => (l._id || l.id) === id ? lead : l));
    return lead;
  }, []);

  const setFollowUp = useCallback(async (id, followUpDate, note = '') => {
    const lead = await apiJson(`/leads/${id}/follow-up`, {
      method: 'PATCH',
      body: JSON.stringify({ followUpDate, note }),
    });
    setLeads(prev => prev.map(l => (l._id || l.id) === id ? lead : l));
    return lead;
  }, []);

  const completeFollowUp = useCallback(async (id, note = '') => {
    const lead = await apiJson(`/leads/${id}/follow-up/complete`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
    setLeads(prev => prev.map(l => (l._id || l.id) === id ? lead : l));
    return lead;
  }, []);

  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        [l.customerName, l.company, l.phone, l.inquiry, l.city, l.assignedToName]
          .some(v => v && v.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'All') result = result.filter(l => l.status === statusFilter);
    if (cityFilter !== 'All') result = result.filter(l => l.city === cityFilter);
    if (assigneeFilter === 'Unassigned') {
      result = result.filter(l => !l.assignedTo);
    } else if (assigneeFilter !== 'All') {
      result = result.filter(l => String(l.assignedTo) === assigneeFilter);
    }

    result.sort((a, b) => {
      let av = a[sortConfig.key] ?? '';
      let bv = b[sortConfig.key] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
      if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, searchQuery, statusFilter, cityFilter, assigneeFilter, sortConfig]);

  const uniqueCities = useMemo(() => {
    return ['All', ...[...new Set(leads.map(l => l.city).filter(Boolean))].sort()];
  }, [leads]);

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
    leads.forEach((l) => {
      const status = l.status || 'New';
      counts[status] = (counts[status] ?? 0) + 1;
    });
    return counts;
  }, [leads]);

  const syncTradeIndia = useCallback(async () => {
    setSyncing(true);
    setSyncMessage(null);
    setSyncError(null);
    try {
      const data = await apiJson('/leads/sync-tradeindia', { method: 'POST' });
      setSyncMessage(data.message);
      await fetchLeads({ silent: true });
      return data;
    } catch (err) {
      setSyncError(err.message || 'Failed to sync TradeIndia leads');
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [fetchLeads]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  }, []);

  return {
    leads, filteredLeads, loading, error,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    cityFilter, setCityFilter,
    assigneeFilter, setAssigneeFilter,
    sortConfig, handleSort,
    uniqueCities, statusCounts,
    totalCount: leads.length,
    addLead, updateLead, updateLeadStatus, deleteLead,
    fetchLeadById, addNote, setFollowUp, completeFollowUp,
    refetch: fetchLeads,
    syncTradeIndia, syncing, syncMessage, syncError,
    statusToast, setStatusToast,
  };
}

export function LeadsProvider({ children }) {
  const value = useLeadsState();
  return (
    <LeadsContext.Provider value={value}>
      {children}
      {value.statusToast && (
        <Toast
          message={value.statusToast.message}
          type={value.statusToast.type}
          onClose={() => value.setStatusToast(null)}
        />
      )}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
}
