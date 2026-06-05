import React from 'react';
import { FOLLOW_UP_TABS } from '../../utils/followUps';

const FollowUpTabs = ({ activeTab, onChange, counts }) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-1">
    {FOLLOW_UP_TABS.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all
          ${activeTab === tab.id
            ? 'bg-surface-card border-brand-500/40 text-white'
            : 'bg-transparent border-surface-border text-gray-500 hover:text-gray-300'}
        `}
      >
        <span>{tab.label}</span>
        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
          activeTab === tab.id ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-hover text-gray-500'
        }`}>
          {counts[tab.id] || 0}
        </span>
      </button>
    ))}
  </div>
);

export default FollowUpTabs;
