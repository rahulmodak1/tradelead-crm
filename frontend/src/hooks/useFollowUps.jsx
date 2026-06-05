import { useCallback, useMemo } from 'react';
import { apiJson } from '../utils/apiClient';
import { useLeads } from './useLeads';
import {
  groupFollowUps,
  summarizeFollowUps,
} from '../utils/followUps';

export function useFollowUps() {
  const {
    leads,
    loading,
    error,
    refetch,
  } = useLeads();

  const groups = useMemo(() => groupFollowUps(leads), [leads]);
  const summary = useMemo(() => summarizeFollowUps(leads), [leads]);

  const refreshFollowUps = useCallback((options = {}) => {
    return refetch(options);
  }, [refetch]);

  const addFollowUpNote = useCallback(async (leadId, payload) => {
    const lead = await apiJson(`/follow-ups/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await refetch({ silent: true });
    return lead;
  }, [refetch]);

  const completeFollowUp = useCallback(async (leadId, payload) => {
    const lead = await apiJson(`/follow-ups/${leadId}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await refetch({ silent: true });
    return lead;
  }, [refetch]);

  const rescheduleFollowUp = useCallback(async (leadId, payload) => {
    const lead = await apiJson(`/follow-ups/${leadId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await refetch({ silent: true });
    return lead;
  }, [refetch]);

  return {
    groups,
    summary,
    loading,
    error,
    refreshFollowUps,
    addFollowUpNote,
    completeFollowUp,
    rescheduleFollowUp,
  };
}
