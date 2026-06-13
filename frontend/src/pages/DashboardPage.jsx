import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Flame, RefreshCw, CheckCircle2,
  TrendingUp, Calendar, ArrowRight, Zap,
  Activity, Target, Clock, AlertTriangle,
} from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { statsData } from '../data/dummyData';
import StatusBadge from '../components/ui/StatusBadge';
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
// ─── Clickable Stat Card ──────────────────────────────────────────────────────
/**
 * PART 1: StatCard is now a clickable navigation element.
 *
 * Requirements met:
 *  - cursor-pointer
 *  - scale(1.02) on hover via Tailwind hover:scale-[1.02]
 *  - transition: all 0.2s ease
 *  - title tooltip
 *  - preserves existing dark theme + card layout exactly
 *  - uses React Router <Link> (not window.location) — no full page reload
 */
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend,
  trendValue,
  index = 0,
  // Navigation props (PART 1)
  to,          // React Router path to navigate to
  tooltip,     // title attribute shown on hover
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingUp : null;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500';

  const cardContent = (
    <div
      className={`
        stat-card animate-slide-up
        ${to ? 'cursor-pointer hover:scale-[1.02] hover:border-brand-600 hover:shadow-glow' : ''}
      `}
      style={{
        animationDelay:    `${index * 0.08}s`,
        animationFillMode: 'forwards',
        opacity:           0,
        // PART 1: explicit transition so scale + border animate smoothly
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      // Tooltip — shows destination on hover (PART 1)
      title={tooltip || title}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{subtitle}</p>
        {trendValue && TrendIcon && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={12} />
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );

  // PART 1: Wrap in <Link> only when a destination is provided
  if (to) {
    return (
      <Link to={to} className="block no-underline">
        {cardContent}
      </Link>
    );
  }
  return cardContent;
};

// ─── DashboardPage ────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { leads, loading, statusCounts } = useLeads();

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const todayFollowUps = leads.filter((l) => {
    if (!l.followUpDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return l.followUpDate.split('T')[0] === today;
  });

  const overdueLeads = leads.filter((l) => {
    if (!l.followUpDate || l.status === 'Closed') return false;
    return new Date(l.followUpDate) < new Date();
  });

  const conversionRate = leads.length > 0
    ? Math.round(((statusCounts['Closed'] || 0) / leads.length) * 100)
    : 0;
const navigate = useNavigate();
  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">

      {/* Welcome banner */}
      <div className="relative bg-gradient-to-r from-brand-900/60 via-brand-800/30 to-transparent border border-brand-800/40 rounded-2xl p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">
              TradeIndia CRM
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
            Good morning, Admin! 👋
          </h1>
          <p className="text-sm text-gray-400">
            You have{' '}
            <span className="text-amber-400 font-semibold">{todayFollowUps.length} follow-ups</span>{' '}
            today
            {overdueLeads.length > 0 && (
              <> and{' '}
                <span className="text-red-400 font-semibold">{overdueLeads.length} overdue</span>{' '}
                leads.
              </>
            )}.
          </p>
        </div>
      </div>

      {/* ── PART 1: Stat cards — all clickable ───────────────────────────────
          Each card navigates to the correct filtered route.
          tooltip tells the user where they're going.
          Cards 1-4: main stats row
      ────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Total Leads → /leads */}
        <StatCard
          title="Total Leads"
          value={leads.length || statsData.totalLeads}
          subtitle="All time leads"
          icon={Users}
          iconColor="bg-blue-500/15 text-blue-400"
          trend="up"
          trendValue="+12%"
          index={0}
          to="/leads"
          tooltip="View all leads"
        />

        {/* 2. Hot Leads → /hot-leads  (PART 6) */}
        <StatCard
          title="Hot Leads"
          value={statusCounts['Hot'] || statsData.hotLeads}
          subtitle="Needs attention"
          icon={Flame}
          iconColor="bg-red-500/15 text-red-400"
          trend="up"
          trendValue="+5"
          index={1}
          to="/hot-leads"
          tooltip="View hot leads only"
        />

        {/* 3. Follow-ups → /follow-ups */}
        <StatCard
          title="Follow-ups"
          value={statusCounts['Follow Up'] || statsData.followUps}
          subtitle="Pending follow-ups"
          icon={RefreshCw}
          iconColor="bg-amber-500/15 text-amber-400"
          trend="down"
          trendValue="-3"
          index={2}
          to="/follow-ups"
          tooltip="View all follow-ups"
        />

        {/* 4. Closed Deals → /leads?status=Closed */}
        <StatCard
          title="Closed Deals"
          value={statusCounts['Closed'] || statsData.closedDeals}
          subtitle={`${conversionRate}% conversion`}
          icon={CheckCircle2}
          iconColor="bg-emerald-500/15 text-emerald-400"
          trend="up"
          trendValue="+8"
          index={3}
          to="/leads?status=Closed"
          tooltip="View closed deals"
        />
      </div>

      {/* Cards 5-7: follow-up breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* 5. Due Today → /follow-ups?filter=today */}
        <StatCard
          title="Due Today"
          value={todayFollowUps.length}
          subtitle="Scheduled for today"
          icon={Calendar}
          iconColor="bg-amber-500/15 text-amber-400"
          index={4}
          to="/follow-ups?filter=today"
          tooltip="View today's follow-ups"
        />

        {/* 6. Overdue → /follow-ups?filter=overdue */}
        <StatCard
          title="Overdue"
          value={overdueLeads.length}
          subtitle="Past due, action needed"
          icon={AlertTriangle}
          iconColor="bg-red-500/15 text-red-400"
          index={5}
          to="/follow-ups?filter=overdue"
          tooltip="View overdue follow-ups"
        />

        {/* 7. Upcoming → /follow-ups?filter=upcoming */}
        <StatCard
          title="Upcoming"
          value={
            leads.filter((l) => {
              if (!l.followUpDate || l.status === 'Closed') return false;
              return new Date(l.followUpDate) > new Date();
            }).length
          }
          subtitle="Scheduled ahead"
          icon={TrendingUp}
          iconColor="bg-blue-500/15 text-blue-400"
          index={6}
          to="/follow-ups?filter=upcoming"
          tooltip="View upcoming follow-ups"
        />
      </div>

      {/* Two column layout — unchanged from original */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent Leads */}
        <div className="xl:col-span-2 bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-brand-400" />
              <h2 className="font-bold text-white text-sm">Recent Leads</h2>
            </div>
            <Link
              to="/leads"
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-surface-border/50">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-surface-border border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : recentLeads.map((lead, i) => (
           <div
  key={lead._id}
 onClick={() => navigate(`/leads/${lead._id}`)}
  className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-hover transition-colors animate-row cursor-pointer"
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
              </div>
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
                {todayFollowUps.length}
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-52 overflow-y-auto">
              {todayFollowUps.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-4">
                  No follow-ups scheduled today 🎉
                </p>
              ) : todayFollowUps.map((lead) => (
                <div key={lead._id} className="flex items-center gap-3 p-3 bg-surface-hover rounded-xl">
                  <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-amber-400 text-xs font-bold">
                      {lead.customerName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-200 truncate">{lead.customerName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{lead.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-surface-border">
              <Target size={15} className="text-brand-400" />
              <h2 className="font-bold text-white text-sm">Status Breakdown</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { status: 'Hot',       color: 'bg-red-500',     textColor: 'text-red-400'     },
                { status: 'New',       color: 'bg-blue-500',    textColor: 'text-blue-400'    },
                { status: 'Follow Up', color: 'bg-amber-500',   textColor: 'text-amber-400'   },
                { status: 'Closed',    color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              ].map(({ status, color, textColor }) => {
                const count = statusCounts[status] || 0;
                const pct   = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
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
