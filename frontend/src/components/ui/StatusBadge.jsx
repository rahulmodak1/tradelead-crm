import React from 'react';
import { Flame, Star, RefreshCw, CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  Hot: {
    className: 'badge-hot',
    Icon: Flame,
    dot: 'bg-red-400',
  },
  New: {
    className: 'badge-new',
    Icon: Star,
    dot: 'bg-blue-400',
  },
  'Follow Up': {
    className: 'badge-followup',
    Icon: RefreshCw,
    dot: 'bg-amber-400',
  },
  Closed: {
    className: 'badge-closed',
    Icon: CheckCircle2,
    dot: 'bg-emerald-400',
  },
};

const StatusBadge = ({ status, showIcon = true, size = 'default' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['New'];
  const { className, Icon, dot } = config;

  if (size === 'dot') {
    return (
      <span className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dot} animate-pulse-soft`} />
        <span className="text-sm text-gray-300">{status}</span>
      </span>
    );
  }

  return (
    <span className={className}>
      {showIcon && <Icon size={10} strokeWidth={2.5} />}
      {status}
    </span>
  );
};

export const STATUS_OPTIONS = ['New', 'Hot', 'Follow Up', 'Closed'];

export default StatusBadge;
