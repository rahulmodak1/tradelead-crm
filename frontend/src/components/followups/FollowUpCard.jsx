import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Building2, CalendarClock, CheckCircle2, MapPin, MessageSquarePlus, Phone, RefreshCw } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { latestFollowUpNote } from '../../utils/followUps';

const FollowUpCard = ({
  lead,
  onComplete,
  onReschedule,
  onAddNote,
}) => {
  const note = latestFollowUpNote(lead);

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-4 hover:border-brand-700 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link to={`/leads/${lead._id}`} className="text-base font-bold text-white hover:text-brand-400 transition-colors">
              {lead.customerName || 'Unnamed Lead'}
            </Link>
            <StatusBadge status={lead.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1.5 min-w-0">
              <Phone size={12} className="shrink-0" />
              <span className="truncate">{lead.phone || 'No phone'}</span>
            </span>
            <span className="flex items-center gap-1.5 min-w-0">
              <Building2 size={12} className="shrink-0" />
              <span className="truncate">{lead.company || 'No company'}</span>
            </span>
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{lead.city || 'No city'}</span>
            </span>
            <span className="flex items-center gap-1.5 min-w-0">
              <CalendarClock size={12} className="shrink-0" />
              <span>{lead.followUpDate ? format(new Date(lead.followUpDate), 'dd MMM yyyy') : 'No date'}</span>
            </span>
          </div>

          {lead.inquiry && (
            <p className="text-sm text-gray-400 mt-3 line-clamp-2">{lead.inquiry}</p>
          )}

          {note && (
            <p className="text-xs text-gray-500 mt-3 bg-surface-hover rounded-xl border border-surface-border px-3 py-2 whitespace-pre-wrap line-clamp-3">
              {note}
            </p>
          )}

          <p className="text-xs text-gray-600 mt-3">
            Assigned to {lead.assignedToName || 'Unassigned'}
          </p>
        </div>

        <div className="flex lg:flex-col gap-2 shrink-0">
          <button type="button" onClick={() => onComplete(lead)} className="btn-primary justify-center">
            <CheckCircle2 size={14} />
            Complete
          </button>
          <button type="button" onClick={() => onReschedule(lead)} className="btn-ghost justify-center">
            <RefreshCw size={14} />
            Reschedule
          </button>
          <button type="button" onClick={() => onAddNote(lead)} className="btn-ghost justify-center">
            <MessageSquarePlus size={14} />
            Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpCard;
