import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, Pencil, Trash2, AlertTriangle,
  User, Phone, Mail, Building2, MapPin, Package, FileText,
  Globe, Calendar, RefreshCw, FileText as Document,
} from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../hooks/useAuth';
import { canAssignLeads, canDeleteLeads, canCreateQuotation } from '../utils/permissions';
import StatusBadge, { STATUS_OPTIONS } from '../components/ui/StatusBadge';
import LeadModal from '../components/leads/LeadModal';
import CommunicationButtons from '../components/leads/detail/CommunicationButtons';
import AssignLeadSelect from '../components/leads/AssignLeadSelect';
import FollowUpSection from '../components/leads/detail/FollowUpSection';
import ActivityTimeline, { ActivityTimelineHeader } from '../components/leads/detail/ActivityTimeline';
import QuoteModal from '../components/leads/QuoteModal';

const DetailField = ({ icon: Icon, label, value, mono = false }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
      <Icon size={11} /> {label}
    </p>
    <p className={`text-sm text-gray-200 ${mono ? 'font-mono' : 'font-medium'} break-words`}>
      {value || '—'}
    </p>
  </div>
);

const LeadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    leads,
    fetchLeadById,
    updateLead,
    updateLeadStatus,
    deleteLead,
    addNote,
    setFollowUp,
    completeFollowUp,
    refetch,
  } = useLeads();
  const { assignableUsers, assignLead } = useTeam();
  const { user } = useAuth();
  const canAssign = canAssignLeads(user);
  const canDelete = canDeleteLeads(user);
  const canCreateQuote = canCreateQuotation(user);

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const cachedLead = useMemo(
    () => leads.find(l => (l._id || l.id) === id),
    [leads, id]
  );
  const displayLead = lead ?? cachedLead;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchLeadById(id);
        if (!cancelled) setLead(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load lead');
          setLead(prev => prev ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, fetchLeadById]);

  const refreshLead = async () => {
    const data = await fetchLeadById(id);
    setLead(data);
    return data;
  };

  const handleSave = async (formData) => {
    await updateLead(id, formData);
    await refreshLead();
    setModalOpen(false);
  };

  const handleStatusChange = async (status) => {
    setStatusUpdating(true);
    try {
      await updateLeadStatus(id, status);
      await refreshLead();
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this lead? This action cannot be undone.')) return;
    try {
      await deleteLead(id);
      navigate('/leads');
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleAddNote = async (text) => {
    const updated = await addNote(id, text);
    setLead(updated);
  };

  const handleSetFollowUp = async (followUpDate, note) => {
    const updated = await setFollowUp(id, followUpDate, note);
    setLead(updated);
  };

  const handleCompleteFollowUp = async (note) => {
    const updated = await completeFollowUp(id, note);
    setLead(updated);
  };

  const handleAssignLead = async (leadId, userId) => {
    const updated = await assignLead(leadId, userId);
    setLead(updated);
    await refetch();
  };

  if (loading && !displayLead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-2 border-surface-border border-t-brand-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading lead details...</p>
      </div>
    );
  }

  if (error && !displayLead) {
    return (
      <div className="p-4 lg:p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-10 flex flex-col items-center gap-4 text-center">
          <AlertTriangle size={32} className="text-red-400" />
          <p className="text-red-400 font-semibold">{error}</p>
          <Link to="/leads" className="btn-ghost">
            <ArrowLeft size={14} /> Back to Leads
          </Link>
        </div>
      </div>
    );
  }

  if (!displayLead) return null;

  const activeLead = lead ?? displayLead;

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/leads')}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back to Leads
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600/40 to-brand-900/40 border border-brand-500/25 flex items-center justify-center shrink-0">
              <span className="text-brand-400 font-bold text-xl">
                {activeLead.customerName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {activeLead.customerName}
                </h1>
                <StatusBadge status={activeLead.status} />
              </div>
              <p className="text-sm text-gray-500">
                {activeLead.company}{activeLead.city ? ` · ${activeLead.city}` : ''}
              </p>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <Calendar size={11} />
                Created {format(new Date(activeLead.createdAt), 'dd MMM yyyy, h:mm a')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={activeLead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
              className="input-field w-auto min-w-[140px] text-sm py-2"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {canCreateQuote && (
              <button onClick={() => setShowQuoteModal(true)} className="btn-ghost">
                <Document size={14} /> Create Quotation
              </button>
            )}
            <button onClick={() => setModalOpen(true)} className="btn-ghost">
              <Pencil size={14} /> Edit
            </button>
            {canDelete && (
              <button onClick={handleDelete} className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20">
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile communication bar (sticky) */}
      <div className="lg:hidden sticky top-16 z-10 -mx-4 px-4 py-3 bg-surface/95 backdrop-blur-md border-y border-surface-border">
        <CommunicationButtons lead={activeLead} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left column — lead info */}
        <div className="xl:col-span-2 space-y-5">
          {/* Lead details card */}
          <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-border">
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <User size={16} className="text-brand-400" />
                Lead Information
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DetailField icon={User} label="Name" value={activeLead.customerName} />
              <DetailField icon={Phone} label="Phone" value={activeLead.phone} mono />
              <DetailField icon={Mail} label="Email" value={activeLead.email} />
              <DetailField icon={Building2} label="Company" value={activeLead.company} />
              <DetailField icon={MapPin} label="City" value={activeLead.city} />
              <DetailField icon={Package} label="Product" value={activeLead.product} />
              <DetailField icon={Globe} label="Source" value={activeLead.source} />
              <DetailField icon={RefreshCw} label="Status" value={activeLead.status} />
              <DetailField icon={User} label="Assigned To" value={activeLead.assignedToName || 'Unassigned'} />
              <div className="sm:col-span-2">
                <DetailField icon={FileText} label="Inquiry" value={activeLead.inquiry} />
              </div>
              <DetailField
                icon={Calendar}
                label="Created Date"
                value={format(new Date(activeLead.createdAt), 'dd MMM yyyy, h:mm a')}
              />
            </div>
          </div>

          {/* Desktop communication */}
          <div className="hidden lg:block bg-surface-card border border-surface-border rounded-2xl p-5">
            <h2 className="font-bold text-white text-sm mb-4">Communication</h2>
            <CommunicationButtons lead={activeLead} />
          </div>

          {/* Activity timeline */}
          <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
            <ActivityTimelineHeader />
            <ActivityTimeline lead={activeLead} />
          </div>
        </div>

        {/* Right column — follow-ups */}
        <div className="space-y-5">
          {canAssign && (
            <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
              <AssignLeadSelect
                lead={activeLead}
                users={assignableUsers}
                onAssign={handleAssignLead}
              />
            </div>
          )}

          <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-border">
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <Calendar size={16} className="text-amber-400" />
                Follow-up
              </h2>
              {activeLead.followUpDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Next: {format(new Date(activeLead.followUpDate), 'dd MMM yyyy')}
                </p>
              )}
            </div>
            <div className="p-5">
              <FollowUpSection
                lead={activeLead}
                onSetFollowUp={handleSetFollowUp}
                onCompleteFollowUp={handleCompleteFollowUp}
                onAddNote={handleAddNote}
              />
            </div>
          </div>
        </div>
      </div>

      <LeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        lead={activeLead}
      />

      {showQuoteModal && (
        <QuoteModal quote={null} onClose={() => setShowQuoteModal(false)} initialLeadId={id} />
      )}
    </div>
  );
};

export default LeadDetailPage;
