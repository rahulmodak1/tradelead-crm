import React from 'react';
import { format } from 'date-fns';
import {
  UserPlus, RefreshCw, StickyNote, Calendar, CheckCircle2, Activity,
  UserCheck, Pencil,
} from 'lucide-react';

const ACTIVITY_CONFIG = {
  created: {
    icon: UserPlus,
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    label: 'Lead created',
  },
  status_changed: {
    icon: RefreshCw,
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    label: 'Status changed',
  },
  note_added: {
    icon: StickyNote,
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    label: 'Note added',
  },
  follow_up_set: {
    icon: Calendar,
    color: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    label: 'Follow-up scheduled',
  },
  follow_up_completed: {
    icon: CheckCircle2,
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    label: 'Follow-up completed',
  },
  follow_up_rescheduled: {
    icon: Calendar,
    color: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    label: 'Follow-up rescheduled',
  },
  assigned: {
    icon: UserCheck,
    color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    label: 'Lead assigned',
  },
  reassigned: {
    icon: UserCheck,
    color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    label: 'Lead reassigned',
  },
  updated: {
    icon: Pencil,
    color: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    label: 'Lead updated',
  },
};

export function buildActivityList(lead) {
  const items = [...(lead.activities || [])];

  if (items.length === 0 && lead.createdAt) {
    items.push({
      type: 'created',
      message: 'Lead created',
      createdAt: lead.createdAt,
    });
  }

  return items.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

const ActivityTimeline = ({ lead }) => {
  const activities = buildActivityList(lead);

  if (activities.length === 0) {
    return (
      <p className="text-sm text-gray-600 text-center py-6">No activity yet</p>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, idx) => {
        const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.created;
        const Icon = config.icon;
        const isLast = idx === activities.length - 1;

        return (
          <div key={activity._id || `${activity.type}-${activity.createdAt}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${config.color}`}>
                <Icon size={14} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 min-h-[24px] bg-surface-border my-1" />
              )}
            </div>
            <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-5'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-200">{config.label}</p>
                <time className="text-[10px] text-gray-600 whitespace-nowrap shrink-0">
                  {format(new Date(activity.createdAt), 'dd MMM yyyy, h:mm a')}
                </time>
              </div>
              {activity.message && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{activity.message}</p>
              )}
              {activity.performedBy?.userName && (
                <p className="text-[10px] text-gray-600 mt-1">
                  by <span className="text-gray-400">{activity.performedBy.userName}</span>
                  {activity.performedBy.userRole && (
                    <span className="text-gray-600"> · {activity.performedBy.userRole}</span>
                  )}
                </p>
              )}
              {activity.meta?.text && activity.type === 'note_added' && (
                <p className="text-xs text-gray-400 mt-1.5 bg-surface-hover rounded-lg px-3 py-2 border border-surface-border italic">
                  "{activity.meta.text}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ActivityTimelineHeader = () => (
  <div className="flex items-center gap-2 mb-4">
    <Activity size={16} className="text-brand-400" />
    <h3 className="font-bold text-white text-sm">Activity Timeline</h3>
  </div>
);

export default ActivityTimeline;
