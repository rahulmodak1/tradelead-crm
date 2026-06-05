import api from './api';

export const leadsService = {
  // Get all leads with optional filters
  getLeads: async (params = {}) => {
    try {
      const response = await api.get('/leads', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single lead by ID
  getLeadById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  // Create new lead
  createLead: async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  // Update lead
  updateLead: async (id, leadData) => {
    const response = await api.put(`/leads/${id}`, leadData);
    return response.data;
  },

  // Update lead status
  updateLeadStatus: async (id, status) => {
    const response = await api.patch(`/leads/${id}/status`, { status });
    return response.data;
  },

  // Delete lead
  deleteLead: async (id) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },

  // Search leads
  searchLeads: async (query) => {
    const response = await api.get('/leads/search', { params: { q: query } });
    return response.data;
  },
};
