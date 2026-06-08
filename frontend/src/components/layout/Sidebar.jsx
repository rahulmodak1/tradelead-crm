import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Flame, RefreshCw,
  BarChart3, MessageSquare, FileText, Target,
  Settings, HelpCircle, ChevronRight, Zap,
  Bell, X,
} from 'lucide-react';

/**
 * NAV_ITEMS — each item uses `exact` pathname for matching.
 *
 * PART 2 FIX: We do NOT use NavLink's built-in isActive (which uses
 * pathname.startsWith) because /leads would activate for both
 * "/leads" and "/hot-leads" if they share a prefix.
 *
 * Instead we compare `location.pathname === item.path` exactly,
 * so only one item is ever active at a time.
 */
const NAV_ITEMS = [
  {
    section: 'Main',
    links: [
      { path: '/',             icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/leads',        icon: Users,           label: 'Leads',      badge: null },
      { path: '/hot-leads',    icon: Flame,           label: 'Hot Leads',  badge: null },
      { path: '/follow-ups',   icon: RefreshCw,       label: 'Follow-ups', badge: null },
      { path: '/quotations',   icon: FileText,        label: 'Quotations', badge: null },
      { path: '/analytics',    icon: BarChart3,       label: 'Analytics' },
    ],
  },
  {
    section: 'Tools',
    links: [
      { path: '/messages', icon: MessageSquare, label: 'Messages' },
      { path: '/reports',  icon: FileText,      label: 'Reports'  },
      { path: '/targets',  icon: Target,        label: 'Targets'  },
    ],
  },
  {
    section: 'System',
    links: [
      { path: '/settings', icon: Settings,    label: 'Settings'      },
      { path: '/help',     icon: HelpCircle,  label: 'Help & Support'},
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  // PART 2: read exact pathname — never use .includes() for active matching
  const { pathname } = useLocation();

  return (
    <>
      {/* Mobile overlay */}
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
        {/* Logo */}
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_ITEMS.map(({ section, links }) => (
            <div key={section}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-3 mb-2">
                {section}
              </p>
              <div className="space-y-0.5">
                {links.map(({ path, icon: Icon, label, badge }) => {
                  /**
                   * PART 2 FIX: strict equality — never startsWith or includes.
                   * "/leads"     is active ONLY when pathname === "/leads"
                   * "/hot-leads" is active ONLY when pathname === "/hot-leads"
                   * "/"          is active ONLY when pathname === "/"
                   */
                  const isActive = pathname === path;

                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                        transition-all duration-200 cursor-pointer group
                        ${isActive
                          ? 'text-brand-400 bg-brand-500/10 border border-brand-500/20'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-surface-hover border border-transparent'
                        }
                      `}
                    >
                      <Icon size={16} strokeWidth={2} className="shrink-0" />
                      <span className="flex-1">{label}</span>
                      {badge && (
                        <span className="bg-brand-500/20 text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-500/20">
                          {badge}
                        </span>
                      )}
                      <ChevronRight
                        size={12}
                        className="opacity-0 group-hover:opacity-50 transition-opacity"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom user card */}
        <div className="p-3 border-t border-surface-border">
          <div className="bg-surface-hover rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-200 truncate">Admin User</p>
              <p className="text-[10px] text-gray-500 truncate">admin@tradeindia.com</p>
            </div>
            <Bell size={14} className="text-gray-500 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
