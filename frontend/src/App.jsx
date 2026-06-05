import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import LoginPage from './pages/LoginPage';
import TeamPage from './pages/TeamPage';
import FollowUpsPage from './pages/FollowUpsPage';
import { AuthProvider } from './hooks/useAuth';
import { LeadsProvider, useLeads } from './hooks/useLeads';
import { TeamProvider } from './hooks/useTeam';
import {
  AnalyticsPage, MessagesPage,
  ReportsPage, TargetsPage, SettingsPage, HelpPage
} from './pages/PlaceholderPages';

const AppShell = () => {
  const { refetch } = useLeads();

  const handleAddLead = () => {
    window.location.href = '/leads';
  };

  return (
    <Layout onAddLead={handleAddLead} onRefresh={refetch}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/targets" element={<TargetsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={(
          <ProtectedRoute>
            <TeamProvider>
              <LeadsProvider>
                <AppShell />
              </LeadsProvider>
            </TeamProvider>
          </ProtectedRoute>
        )}
      />
    </Routes>
  </AuthProvider>
);

export default App;
