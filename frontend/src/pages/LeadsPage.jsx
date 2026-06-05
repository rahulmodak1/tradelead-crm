import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, RefreshCw, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../hooks/useAuth';
import { canAssignLeads, canSyncTradeIndia } from '../utils/permissions';
import LeadTable from '../components/leads/LeadTable';
import SearchFilterBar from '../components/leads/SearchFilterBar';
import LeadModal from '../components/leads/LeadModal';
import BulkAssignBar from '../components/leads/BulkAssignBar';
import StatusBadge from '../components/ui/StatusBadge';

const LeadsPage = () => {
  const { user } = useAuth();
  const {
    leads, filteredLeads, loading, error,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    cityFilter, setCityFilter,
    assigneeFilter, setAssigneeFilter,
    sortConfig, handleSort,
    uniqueCities, statusCounts,
    addLead, updateLead, updateLeadStatus, deleteLead,
    refetch, syncTradeIndia, syncing, syncMessage, syncError,
  } = useLeads();
  const { assignableUsers, bulkAssignLeads, assignLead } = useTeam();

  const location = useLocation();
  const canAssign = canAssignLeads(user);
  const canSync = canSyncTradeIndia(user);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const status = new URLSearchParams(location.search).get('status');
    if (status) setStatusFilter(status);
  }, [location.search, setStatusFilter]);

  const handleOpenAdd = () => {
    setEditingLead(null);
    setSaveError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setEditingLead(lead);
    setSaveError(null);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      setSaveError(null);
      if (editingLead) {
        await updateLead(editingLead._id || editingLead.id, formData);
      } else {
        await addLead(formData);
      }
      setModalOpen(false);
    } catch (err) {
      setSaveError(err.message);
      throw err;
    }
  };

  const handleSyncTradeIndia = async () => {
    try {
      await syncTradeIndia();
    } catch {
      // syncError is set in the hook
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead? This action cannot be undone.')) return;
    try {
      await deleteLead(id);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l._id));
    }
  };

  const handleAssignLead = async (leadId, userId) => {
    await assignLead(leadId, userId);
    await refetch();
  };

  const handleBulkAssign = async (userId) => {
    await bulkAssignLeads(selectedIds, userId);
    setSelectedIds([]);
    await refetch();
  };

  const assigneeOptions = [
    { value: 'All', label: 'All assignees' },
    { value: 'Unassigned', label: 'Unassigned' },
    ...assignableUsers.map(u => ({ value: u._id, label: u.name })),
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Lead Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading…' : `${leads.length} leads`}
            {user?.role === 'Sales Executive' && ' assigned to you'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={refetch} className="btn-ghost">
            <RefreshCw size={14} /> Refresh
          </button>
          {canSync && (
            <button
              onClick={handleSyncTradeIndia}
              disabled={syncing}
              className="btn-ghost hidden sm:flex disabled:opacity-60"
            >
              {syncing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {syncing ? 'Syncing…' : 'Sync TradeIndia Leads'}
            </button>
          )}
          <button onClick={handleOpenAdd} className="btn-primary">+ Add Lead</button>
        </div>
      </div>

      {canAssign && (
        <BulkAssignBar
          selectedCount={selectedIds.length}
          users={assignableUsers}
          onAssign={handleBulkAssign}
          onClear={() => setSelectedIds([])}
        />
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap">
        {['All', 'Hot', 'New', 'Follow Up', 'Closed'].map(s => {
          const count = s === 'All' ? leads.length : (statusCounts[s] || 0);
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all
                ${statusFilter === s
                  ? 'bg-surface-card border-brand-500/40 text-white shadow-sm'
                  : 'bg-transparent border-surface-border text-gray-500 hover:text-gray-300'}
              `}
            >
              {s !== 'All' ? <StatusBadge status={s} showIcon /> : <span>All Leads</span>}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${statusFilter === s ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-hover text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {syncMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-emerald-300">
          <CheckCircle2 size={15} className="shrink-0" />
          <span className="flex-1">{syncMessage}</span>
        </div>
      )}

      {syncError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-400">
          <AlertTriangle size={15} className="shrink-0" />
          <span className="flex-1">{syncError}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-400">
          <AlertTriangle size={15} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={refetch} className="underline text-xs hover:text-red-300">Retry</button>
        </div>
      )}

      <div className="bg-surface-card border border-surface-border rounded-2xl overflow-visible shadow-card">
        <div className="p-4 border-b border-surface-border">
          <SearchFilterBar
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            cityFilter={cityFilter} setCityFilter={setCityFilter}
            assigneeFilter={assigneeFilter} setAssigneeFilter={setAssigneeFilter}
            assigneeOptions={canAssign ? assigneeOptions : null}
            uniqueCities={uniqueCities}
            totalShown={filteredLeads.length} totalLeads={leads.length}
          />
        </div>

        <LeadTable
          leads={filteredLeads}
          sortConfig={sortConfig}
          onSort={handleSort}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onStatusChange={updateLeadStatus}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          assignableUsers={assignableUsers}
          onAssignLead={canAssign ? handleAssignLead : null}
        />

        {!loading && filteredLeads.length > 0 && (
          <div className="px-4 py-3 border-t border-surface-border flex items-center justify-between">
            <p className="text-xs text-gray-600">
              {filteredLeads.length} of {leads.length} leads
            </p>
          </div>
        )}
      </div>

      <LeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        lead={editingLead}
        externalError={saveError}
      />
    </div>
  );
};

export default LeadsPage;
