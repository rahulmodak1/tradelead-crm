import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, RefreshCw, Plus, ChevronRight } from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import { useFollowUps } from '../../hooks/useFollowUps';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/leads': 'Lead Management',
  '/team': 'Team Management',
  '/follow-ups': 'Follow-ups',
  '/analytics': 'Analytics',
  '/messages': 'Messages',
  '/reports': 'Reports',
  '/targets': 'Targets',
  '/settings': 'Settings',
  '/help': 'Help & Support',
};

const Navbar = ({ onMenuToggle, onAddLead, onRefresh }) => {
  const location = useLocation();
  const { leads } = useLeads();
  const { summary } = useFollowUps();

  const isLeadDetail = /^\/leads\/[^/]+$/.test(location.pathname);
  const leadId = isLeadDetail ? location.pathname.split('/')[2] : null;
  const lead = leadId ? leads.find(l => (l._id || l.id) === leadId) : null;

  let pageTitle = PAGE_TITLES[location.pathname] || 'CRM';
  if (isLeadDetail) {
    pageTitle = lead?.customerName || 'Lead Details';
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <header className="h-16 border-b border-surface-border bg-surface-card/80 backdrop-blur-md flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl hover:bg-surface-hover text-gray-400 hover:text-white transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-2 text-sm min-w-0">
        <span className="text-gray-500 shrink-0">TradeIndia CRM</span>
        <ChevronRight size={14} className="text-gray-600 shrink-0" />
        {isLeadDetail ? (
          <>
            <Link to="/leads" className="text-gray-500 hover:text-gray-300 transition-colors shrink-0">
              Leads
            </Link>
            <ChevronRight size={14} className="text-gray-600 shrink-0" />
            <span className="text-gray-200 font-semibold truncate">{pageTitle}</span>
          </>
        ) : (
          <span className="text-gray-200 font-semibold">{pageTitle}</span>
        )}
      </div>

      {/* Mobile title */}
      <h1 className="sm:hidden text-base font-bold text-white truncate">{pageTitle}</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Date */}
      <span className="hidden md:block text-xs text-gray-500 bg-surface-hover px-3 py-1.5 rounded-lg border border-surface-border">
        {today}
      </span>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl hover:bg-surface-hover text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>

        {/* Notification bell */}
        <Link
          to="/follow-ups"
          className="relative p-2 rounded-xl hover:bg-surface-hover text-gray-400 hover:text-white transition-colors"
          title="Follow-up reminders"
        >
          <Bell size={16} />
          {summary.reminderCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border border-surface-card">
              {summary.reminderCount > 99 ? '99+' : summary.reminderCount}
            </span>
          )}
        </Link>

        {/* Add Lead */}
        {onAddLead && (
          <button onClick={onAddLead} className="btn-primary hidden sm:flex">
            <Plus size={15} strokeWidth={2.5} />
            Add Lead
          </button>
        )}
        {onAddLead && (
          <button
            onClick={onAddLead}
            className="sm:hidden p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors shadow-glow"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
