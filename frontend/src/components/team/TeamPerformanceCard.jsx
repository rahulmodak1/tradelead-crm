import React from 'react';
import { Users, Flame, RefreshCw, CheckCircle2 } from 'lucide-react';
import { roleBadgeClass } from '../../utils/permissions';

const TeamPerformanceCard = ({ stats, loading, title = 'Team Performance' }) => {
  if (loading) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-2xl p-8 flex justify-center">
        <div className="w-8 h-8 border-2 border-surface-border border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats?.length) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-2xl p-8 text-center">
        <Users size={28} className="text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No team performance data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-border">
        <h2 className="font-bold text-white text-sm flex items-center gap-2">
          <Users size={16} className="text-brand-400" />
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-surface-border text-[11px] uppercase tracking-widest text-gray-500">
              <th className="text-left px-5 py-3 font-bold">Member</th>
              <th className="text-left px-4 py-3 font-bold">Role</th>
              <th className="text-center px-4 py-3 font-bold">Assigned</th>
              <th className="text-center px-4 py-3 font-bold">Hot</th>
              <th className="text-center px-4 py-3 font-bold">Follow-ups</th>
              <th className="text-center px-4 py-3 font-bold">Closed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/50">
            {stats.map((member) => (
              <tr key={member.userId} className="hover:bg-surface-hover transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600/30 to-brand-900/30 border border-brand-500/15 flex items-center justify-center shrink-0">
                      <span className="text-brand-400 font-bold text-xs">{member.name?.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-200 truncate">{member.name}</p>
                      <p className="text-[10px] text-gray-600 truncate">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${roleBadgeClass(member.role)}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center gap-1 text-gray-300 font-semibold">
                    <Users size={12} className="text-gray-500" /> {member.totalAssigned}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                    <Flame size={12} /> {member.hotLeads}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                    <RefreshCw size={12} /> {member.followUpsPending}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 size={12} /> {member.closedDeals}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamPerformanceCard;
