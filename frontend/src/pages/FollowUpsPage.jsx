import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, CalendarClock, RefreshCw } from 'lucide-react';
import { useFollowUps } from '../hooks/useFollowUps';
import FollowUpTabs from '../components/followups/FollowUpTabs';
import FollowUpList from '../components/followups/FollowUpList';
import FollowUpNoteModal from '../components/followups/FollowUpNoteModal';
import RescheduleFollowUpModal from '../components/followups/RescheduleFollowUpModal';
import FollowUpSummaryWidget from '../components/followups/FollowUpSummaryWidget';

const VALID_TABS = ['today', 'overdue', 'upcoming'];

const FollowUpsPage = () => {
  const location = useLocation();
  const initialTab = useMemo(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    return VALID_TABS.includes(tab) ? tab : 'today';
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [noteMode, setNoteMode] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const {
    groups,
    summary,
    loading,
    error,
    refreshFollowUps,
    addFollowUpNote,
    completeFollowUp,
    rescheduleFollowUp,
  } = useFollowUps();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const counts = {
    today: summary.dueToday,
    overdue: summary.overdue,
    upcoming: summary.upcoming,
  };

  const openNote = (lead) => {
    setSelectedLead(lead);
    setNoteMode('note');
  };

  const openComplete = (lead) => {
    setSelectedLead(lead);
    setNoteMode('complete');
  };

  const openReschedule = (lead) => {
    setSelectedLead(lead);
    setRescheduleOpen(true);
  };

  const closeNote = () => {
    setSelectedLead(null);
    setNoteMode(null);
  };

  const closeReschedule = () => {
    setSelectedLead(null);
    setRescheduleOpen(false);
  };

  const handleSaveNote = async (payload) => {
    if (!selectedLead) return;
    if (noteMode === 'complete') {
      await completeFollowUp(selectedLead._id, payload);
    } else {
      await addFollowUpNote(selectedLead._id, payload);
    }
  };

  const handleReschedule = async (payload) => {
    if (!selectedLead) return;
    await rescheduleFollowUp(selectedLead._id, payload);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarClock size={20} className="text-brand-400" />
            Follow-up Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track today, overdue, and upcoming packaging lead follow-ups.
          </p>
        </div>
        <button type="button" onClick={() => refreshFollowUps()} className="btn-ghost">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FollowUpSummaryWidget type="today" value={summary.dueToday} subtitle="Need action today" />
        <FollowUpSummaryWidget type="overdue" value={summary.overdue} subtitle="Past scheduled date" />
        <FollowUpSummaryWidget type="upcoming" value={summary.upcoming} subtitle="Scheduled later" />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-400">
          <AlertTriangle size={15} />
          <span className="flex-1">{error}</span>
        </div>
      )}

      <FollowUpTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />

      <FollowUpList
        tab={activeTab}
        leads={groups[activeTab] || []}
        loading={loading}
        onComplete={openComplete}
        onReschedule={openReschedule}
        onAddNote={openNote}
      />

      <FollowUpNoteModal
        isOpen={Boolean(noteMode)}
        onClose={closeNote}
        onSave={handleSaveNote}
        lead={selectedLead}
        title={noteMode === 'complete' ? 'Complete Follow-up' : 'Add Follow-up Note'}
        submitLabel={noteMode === 'complete' ? 'Complete Follow-up' : 'Save Note'}
      />

      <RescheduleFollowUpModal
        isOpen={rescheduleOpen}
        onClose={closeReschedule}
        onSave={handleReschedule}
        lead={selectedLead}
      />
    </div>
  );
};

export default FollowUpsPage;
