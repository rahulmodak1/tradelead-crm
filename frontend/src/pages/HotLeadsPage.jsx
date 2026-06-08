/**
 * HotLeadsPage.jsx
 *
 * PART 6: Dedicated page for status=Hot leads.
 * Route: /hot-leads
 *
 * Reuses the existing useLeads hook with statusFilter pre-set to 'Hot'.
 * Does NOT import or duplicate LeadTable — renders its own lean table
 * to avoid coupling to whatever version the user has locally.
 *
 * If your project already has a LeadTable component you're happy with,
 * replace the <table> block below with:
 *   <LeadTable leads={filteredLeads} ... />
 */
import React, { useState } from 'react';
import { Flame, RefreshCw, Search, X } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import StatusBadge from '../components/ui/StatusBadge';
import LeadModal from '../components/leads/LeadModal';
import { leadWhatsAppURL } from '../utils/phoneUtils';

const HotLeadsPage = () => {
  const {
    leads,
    loading,
    error,
    refetch,
    searchQuery, setSearchQuery,
    updateLeadStatus,
    deleteLead,
    updateLead,
    addLead,
  } = useLeads();

  const [modalOpen, setModalOpen]   = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // PART 6: Hard-filter to Hot only — user cannot change this filter on this page
  const hotLeads = leads.filter((l) => l.status === 'Hot');

  // Secondary search within hot leads
  const displayed = searchQuery.trim()
    ? hotLeads.filter((l) => {
        const q = searchQuery.toLowerCase();
        return (
          l.customerName?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q) ||
          l.phone?.includes(q)
        );
      })
    : hotLeads;

  const handleEdit = (lead) => { setEditingLead(lead); setModalOpen(true); };
  const handleSave = async (data) => {
    if (editingLead) await updateLead(editingLead._id, data);
    else             await addLead(data);
  };
  const handleDelete = (id) => {
    if (window.confirm('Delete this lead?')) deleteLead(id);
  };

  // Logged-in user name for WhatsApp message — pull from your auth context if available
  const assignedUser = 'Sales Team'; // TODO: replace with useAuth().user.name

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center border border-red-500/20">
            <Flame size={20} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Hot Leads</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? 'Loading…' : `${hotLeads.length} hot lead${hotLeads.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <button onClick={refetch} className="btn-ghost self-start sm:self-auto">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search hot leads…"
          className="input-field pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-surface-border bg-surface-hover/50">
                {['Customer', 'Phone', 'Company', 'City', 'Inquiry', 'Follow-up', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="w-8 h-8 border-2 border-surface-border border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading hot leads…</p>
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Flame size={32} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 font-semibold">No hot leads</p>
                    <p className="text-gray-600 text-xs mt-1">
                      {searchQuery ? 'No matches — clear your search' : 'Mark leads as Hot from the Leads page'}
                    </p>
                  </td>
                </tr>
              ) : displayed.map((lead) => {
                const waURL = leadWhatsAppURL(lead, assignedUser);
                return (
                  <tr key={lead._id} className="hover:bg-surface-hover transition-colors group">
                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/20 flex items-center justify-center shrink-0">
                          <span className="text-red-400 font-bold text-xs">
                            {lead.customerName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-200">{lead.customerName}</p>
                      </div>
                    </td>
                    {/* Phone */}
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-300">{lead.phone}</td>
                    {/* Company */}
                    <td className="px-4 py-3.5 text-gray-300 max-w-[160px] truncate">{lead.company}</td>
                    {/* City */}
                    <td className="px-4 py-3.5">
                      <span className="text-gray-400 text-xs bg-surface-hover px-2 py-1 rounded-lg border border-surface-border">
                        {lead.city || '—'}
                      </span>
                    </td>
                    {/* Inquiry */}
                    <td className="px-4 py-3.5 text-gray-400 text-xs max-w-[180px] truncate">{lead.inquiry}</td>
                    {/* Follow-up */}
                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {lead.followUpDate
                        ? new Date(lead.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                        : '—'}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* PART 5: WhatsApp with personalized message */}
                        <a
                          href={waURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Send WhatsApp message"
                          className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 transition-colors border border-transparent hover:border-emerald-500/20"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </a>
                        {/* Call */}
                        <a
                          href={`tel:${lead.phone}`}
                          title="Call"
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition-colors border border-transparent hover:border-blue-500/20"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                          </svg>
                        </a>
                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(lead)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-500 hover:text-gray-200 transition-colors border border-transparent hover:border-surface-border"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(lead._id)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="px-4 py-3 border-t border-surface-border text-xs text-gray-600">
            {displayed.length} of {hotLeads.length} hot leads
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <LeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        lead={editingLead}
      />
    </div>
  );
};

export default HotLeadsPage;
