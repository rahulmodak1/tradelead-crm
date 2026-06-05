import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, Clock3 } from 'lucide-react';

const CONFIG = {
  today: {
    title: 'Due Today',
    icon: CalendarClock,
    color: 'text-amber-400 bg-amber-500/15 border-amber-500/20',
  },
  overdue: {
    title: 'Overdue',
    icon: AlertTriangle,
    color: 'text-red-400 bg-red-500/15 border-red-500/20',
  },
  upcoming: {
    title: 'Upcoming',
    icon: Clock3,
    color: 'text-blue-400 bg-blue-500/15 border-blue-500/20',
  },
};

const FollowUpSummaryWidget = ({ type, value, subtitle, to = '/follow-ups' }) => {
  const config = CONFIG[type] || CONFIG.today;
  const Icon = config.icon;

  return (
    <Link
      to={`${to}?tab=${type}`}
      className="bg-surface-card border border-surface-border rounded-2xl p-5 hover:border-brand-700 transition-all duration-300 block"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{config.title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${config.color}`}>
          <Icon size={18} />
        </div>
      </div>
    </Link>
  );
};

export default FollowUpSummaryWidget;
