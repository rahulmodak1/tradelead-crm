import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, Calendar, Settings,
  ChevronRight, Zap, HelpCircle, X, BarChart3,
  MessageSquare, FileText, Target, Loader2, Shield, LogOut, File,
} from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import { useAuth } from '../../hooks/useAuth';
import { useFollowUps } from '../../hooks/useFollowUps';
import { roleBadgeClass } from '../../utils/permissions';

const NAV_ITEMS = [
  {
    section: 'Main',
    links: [
      { id: 'dashboard', to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'leads', to: '/leads', icon: Users, label: 'Leads', countKey: 'total' },
      { id: 'hot-leads', to: '/leads?status=Hot', icon: TrendingUp, label: 'Hot Leads', countKey: 'hot' },
      { id: 'quotes', to: '/quotes', icon: File, label: 'Quotations' },
      { id: 'follow-ups', to: '/follow-ups', icon: Calendar, label: 'Follow-ups', countKey: 'followUp' },
      { id: 'team', to: '/team', icon: Shield, label: 'Team' },
      { id: 'analytics', to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    section: 'Tools',
    links: [
      { id: 'messages', to: '/messages', icon: MessageSquare, label: 'Messages' },
      { id: 'reports', to: '/reports', icon: FileText, label: 'Reports' },
      { id: 'targets', to: '/targets', icon: Target, label: 'Targets' },
    ],
  },
  {
    section: 'System',
    links: [
      { id: 'settings', to: '/settings', icon: Settings, label: 'Settings' },
      { id: 'help', to: '/help', icon: HelpCircle, label: 'Help & Support' },
    ],
  },
];

function resolveSidebarCount(countKey, { leads, statusCounts }) {
  switch (countKey) {
    case 'total':
      return leads.length;
    case 'followUp':
      return statusCounts.followUpsActive ?? 0;
    case 'hot':
      return statusCounts.Hot ?? 0;
    default:
      return null;
  }
}

function SidebarBadge({ countKey, loading, leads, statusCounts }) {
  if (!countKey) return null;

  return (
    <span
      className="bg-brand-500/20 text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-500/20 min-w-[1.5rem] flex items-center justify-center"
      aria-busy={loading}
    >
      {loading ? (
        <Loader2 size={10} className="animate-spin text-brand-400" />
      ) : (
        resolveSidebarCount(countKey, { leads, statusCounts })
      )}
    </span>
  );
}

const Sidebar = ({ isOpen, onClose }) => {
  const { leads, statusCounts, loading } = useLeads();
  const { summary: followUpSummary } = useFollowUps();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = NAV_ITEMS;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-surface-card border-r border-surface-border
        flex flex-col z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow">
              <Zap size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">TradeIndia</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">CRM Pro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_ITEMS.map(({ section, links }) => (
            <div key={section}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-3 mb-2">
                {section}
              </p>
              <div className="space-y-0.5">
                {links.map(({ id, to, icon: Icon, label, countKey }) => (
                  <NavLink
                    key={id}
                    to={to}
                    end={to === '/'}
                    onClick={onClose}
                    className={({ isActive }) => {
                      const leadsDetailActive = id === 'leads' && /^\/leads\/[^/]+$/.test(location.pathname);
                      const active = isActive || leadsDetailActive;
                      return `sidebar-link group ${active ? 'active' : ''}`;
                    }}
                  >
                    <Icon size={16} strokeWidth={2} className="shrink-0" />
                    <span className="flex-1">{label}</span>
                    <SidebarBadge
                      countKey={countKey}
                      loading={loading}
                      leads={leads}
                      statusCounts={{
                        ...statusCounts,
                        followUpsActive: followUpSummary.activePending,
                      }}
                    />
                    <ChevronRight
                      size={12}
                      className="opacity-0 group-hover:opacity-50 transition-opacity"
                    />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-border space-y-2">
          <div className="bg-surface-hover rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-200 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              {user?.role && (
                <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${roleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
