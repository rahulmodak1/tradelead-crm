import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Flame,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Zap,
  Download,
  Loader2,
  Activity,
  Target,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useLeads } from '../hooks/useLeads';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../hooks/useAuth';
import { useFollowUps } from '../hooks/useFollowUps';
import { canSyncTradeIndia, canViewAllLeads } from '../utils/permissions';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import TeamPerformanceCard from '../components/team/TeamPerformanceCard';
import FollowUpSummaryWidget from '../components/followups/FollowUpSummaryWidget';

const DashboardPage = () => {
  const { user } = useAuth();
  const {
    leads, loading, statusCounts,
    syncTradeIndia, syncing, syncMessage, syncError,
  } = useLeads();
  const { teamStats, loading: teamLoading } = useTeam();
  const { groups: followUpGroups, summary: followUpSummary } = useFollowUps();

  const canSync = canSyncTradeIndia(user);
  const showTeamStats = canViewAllLeads(user) || user?.role === 'Sales Executive';

  const handleSyncTradeIndia = async () => {
    try {
      await syncTradeIndia();
    } catch {
      // syncError is set in the hook
    }
  };

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const hotCount = statusCounts['Hot'] ?? 0;
  const followUpCount = followUpSummary.activePending;
  const closedCount = statusCounts['Closed'] ?? 0;

  const conversionRate = leads.length > 0
    ? Math.round((closedCount / leads.length) * 100)
    : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="relative bg-gradient-to-r from-brand-900/60 via-brand-800/30 to-transparent border border-brand-800/40 rounded-2xl p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center">
                <Zap size={13} className="text-white" />
              </div>
              <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">TradeIndia CRM</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Good morning, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-sm text-gray-400">
              You have <span className="text-amber-400 font-semibold">{followUpSummary.dueToday} follow-ups</span> today
              {followUpSummary.overdue > 0 && (
                <> and <span className="text-red-400 font-semibold">{followUpSummary.overdue} overdue</span> leads.</>
              )}.
            </p>
          </div>

          {canSync && (
            <button
              type="button"
              onClick={handleSyncTradeIndia}
              disabled={syncing}
              className="btn-primary shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              {syncing ? 'Syncing…' : 'Sync TradeIndia Leads'}
            </button>
          )}
        </div>

        {syncMessage && (
          <div className="relative mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
            <CheckCircle2 size={16} className="shrink-0" />
            {syncMessage}
          </div>
        )}

        {syncError && (
          <div className="relative mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            <AlertTriangle size={16} className="shrink-0" />
            {syncError}
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={loading ? '—' : leads.length}
          subtitle="All time leads"
          icon={Users}
          iconColor="bg-blue-500/15 text-blue-400"
          index={0}
        />
        <StatCard
          title="Hot Leads"
          value={loading ? '—' : hotCount}
          subtitle="Needs attention"
          icon={Flame}
          iconColor="bg-red-500/15 text-red-400"
          index={1}
        />
        <StatCard
          title="Follow-ups"
          value={loading ? '—' : followUpCount}
          subtitle="Pending follow-ups"
          icon={RefreshCw}
          iconColor="bg-amber-500/15 text-amber-400"
          index={2}
        />
        <StatCard
          title="Closed Deals"
          value={loading ? '—' : closedCount}
          subtitle={`${conversionRate}% conversion`}
          icon={CheckCircle2}
          iconColor="bg-emerald-500/15 text-emerald-400"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FollowUpSummaryWidget
          type="today"
          value={loading ? 'â€”' : followUpSummary.dueToday}
          subtitle="Follow-ups due today"
        />
        <FollowUpSummaryWidget
          type="overdue"
          value={loading ? 'â€”' : followUpSummary.overdue}
          subtitle="Needs immediate action"
        />
        <FollowUpSummaryWidget
          type="upcoming"
          value={loading ? 'â€”' : followUpSummary.upcoming}
          subtitle="Scheduled later"
        />
      </div>

      {showTeamStats && (
        <TeamPerformanceCard
          stats={teamStats}
          loading={teamLoading}
          title={user?.role === 'Sales Executive' ? 'My Performance' : 'Team Performance'}
        />
      )}

      {/* Two column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Leads */}
        <div className="xl:col-span-2 bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-brand-400" />
              <h2 className="font-bold text-white text-sm">Recent Leads</h2>
            </div>
            <Link to="/leads" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-surface-border/50">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-surface-border border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : recentLeads.map((lead, i) => (
              <Link
                key={lead._id}
                to={`/leads/${lead._id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-hover transition-colors animate-row"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600/30 to-brand-900/30 border border-brand-500/15 flex items-center justify-center shrink-0">
                  <span className="text-brand-400 font-bold text-sm">
                    {lead.customerName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-200 truncate">{lead.customerName}</p>
                  <p className="text-xs text-gray-500 truncate">{lead.company} · {lead.city}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-gray-400 truncate max-w-[120px]">{lead.inquiry}</p>
                </div>
                <StatusBadge status={lead.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Today's Follow-ups */}
          <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-surface-border">
              <Clock size={15} className="text-amber-400" />
              <h2 className="font-bold text-white text-sm">Today's Follow-ups</h2>
              <span className="ml-auto bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                {followUpSummary.dueToday}
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-52 overflow-y-auto">
              {followUpGroups.today.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-4">No follow-ups scheduled today 🎉</p>
              ) : followUpGroups.today.map(lead => (
                <Link
                  key={lead._id}
                  to={`/leads/${lead._id}`}
                  className="flex items-center gap-3 p-3 bg-surface-hover rounded-xl hover:bg-surface-border transition-colors"
                >
                  <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-amber-400 text-xs font-bold">{lead.customerName?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-200 truncate">{lead.customerName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{lead.phone}</p>
                  </div>
                  <a
                    href={`https://wa.me/91${lead.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                </Link>
              ))}
            </div>
          </div>

          {/* Lead Status breakdown */}
          <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-surface-border">
              <Target size={15} className="text-brand-400" />
              <h2 className="font-bold text-white text-sm">Status Breakdown</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { status: 'Hot', color: 'bg-red-500', textColor: 'text-red-400' },
                { status: 'New', color: 'bg-blue-500', textColor: 'text-blue-400' },
                { status: 'Follow Up', color: 'bg-amber-500', textColor: 'text-amber-400' },
                { status: 'Closed', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              ].map(({ status, color, textColor }) => {
                const count = statusCounts[status] || 0;
                const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-400">{status}</span>
                      <span className={`text-xs font-bold ${textColor}`}>{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
