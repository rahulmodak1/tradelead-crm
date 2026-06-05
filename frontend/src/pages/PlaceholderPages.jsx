import React from 'react';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4 p-6 animate-fade-in">
    <div className="w-16 h-16 bg-surface-card border border-surface-border rounded-2xl flex items-center justify-center">
      <Construction size={28} className="text-brand-400" />
    </div>
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <p className="text-gray-500 text-sm text-center max-w-xs">{description}</p>
    <span className="text-xs bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1.5 rounded-full">
      Coming Soon
    </span>
  </div>
);

export const AnalyticsPage   = () => <PlaceholderPage title="Analytics" description="Visualize your sales pipeline, conversion rates and team performance." />;
export const MessagesPage    = () => <PlaceholderPage title="Messages" description="Unified inbox for WhatsApp, Email and SMS communication." />;
export const ReportsPage     = () => <PlaceholderPage title="Reports" description="Generate custom reports on leads, revenue and activity." />;
export const TargetsPage     = () => <PlaceholderPage title="Targets" description="Set and track monthly targets for your sales team." />;
export const SettingsPage    = () => <PlaceholderPage title="Settings" description="Configure your CRM preferences, team members and integrations." />;
export const HelpPage        = () => <PlaceholderPage title="Help & Support" description="Documentation, FAQs and support contact for TradeIndia CRM." />;
