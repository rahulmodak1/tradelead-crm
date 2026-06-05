import React from 'react';
import { CalendarClock, Loader2 } from 'lucide-react';
import FollowUpCard from './FollowUpCard';

const EMPTY_COPY = {
  today: 'No follow-ups due today',
  overdue: 'No overdue follow-ups',
  upcoming: 'No upcoming follow-ups',
};

const FollowUpList = ({
  tab,
  leads,
  loading,
  onComplete,
  onReschedule,
  onAddNote,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 size={28} className="animate-spin text-brand-500" />
        <p className="text-sm text-gray-500">Loading follow-ups...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 bg-surface-card border border-surface-border rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-surface-hover border border-surface-border flex items-center justify-center">
          <CalendarClock size={24} className="text-gray-600" />
        </div>
        <p className="text-gray-400 font-semibold">{EMPTY_COPY[tab] || 'No follow-ups found'}</p>
        <p className="text-gray-600 text-sm">Completed or rescheduled items will leave this list automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <FollowUpCard
          key={lead._id}
          lead={lead}
          onComplete={onComplete}
          onReschedule={onReschedule}
          onAddNote={onAddNote}
        />
      ))}
    </div>
  );
};

export default FollowUpList;
