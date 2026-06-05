import {
  useState, useEffect, useCallback, createContext, useContext,
} from 'react';
import { apiJson } from '../utils/apiClient';
import { useAuth } from './useAuth';

const TeamContext = createContext(null);

function TeamProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiJson('/users');
      setUsers(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const fetchAssignableUsers = useCallback(async () => {
    try {
      const data = await apiJson('/users/assignable');
      setAssignableUsers(data);
      return data;
    } catch {
      setAssignableUsers([]);
      return [];
    }
  }, []);

  const fetchTeamStats = useCallback(async () => {
    try {
      const data = await apiJson('/team/stats');
      setTeamStats(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const refreshTeam = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchAssignableUsers(),
        fetchTeamStats(),
      ]);
      try {
        await fetchUsers();
      } catch {
        // Managers/Sales may not have access to full user list
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchUsers, fetchAssignableUsers, fetchTeamStats]);

  useEffect(() => {
    if (isAuthenticated) refreshTeam();
  }, [isAuthenticated, refreshTeam]);

  const createUser = useCallback(async (payload) => {
    const user = await apiJson('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await refreshTeam();
    return user;
  }, [refreshTeam]);

  const updateUser = useCallback(async (id, payload) => {
    const user = await apiJson(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    await refreshTeam();
    return user;
  }, [refreshTeam]);

  const deleteUser = useCallback(async (id) => {
    await apiJson(`/users/${id}`, { method: 'DELETE' });
    await refreshTeam();
  }, [refreshTeam]);

  const assignLead = useCallback(async (leadId, userId) => {
    return apiJson(`/team/leads/${leadId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  }, []);

  const bulkAssignLeads = useCallback(async (leadIds, userId) => {
    return apiJson('/team/leads/bulk-assign', {
      method: 'POST',
      body: JSON.stringify({ leadIds, userId }),
    });
  }, []);

  return (
    <TeamContext.Provider value={{
      users,
      assignableUsers,
      teamStats,
      loading,
      error,
      refreshTeam,
      fetchUsers,
      createUser,
      updateUser,
      deleteUser,
      assignLead,
      bulkAssignLeads,
    }}>
      {children}
    </TeamContext.Provider>
  );
}

function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}

export { TeamProvider, useTeam };
