import { apiJson, apiFetch } from './apiClient';

export const quotesService = {
  // List quotations with filters
  async listQuotations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiJson(`/quotations${query ? '?' + query : ''}`);
  },

  // Get single quotation
  async getQuotation(id) {
    return apiJson(`/quotations/${id}`);
  },

  // Create quotation
  async createQuotation(data) {
    const res = await apiFetch('/quotations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Update quotation
  async updateQuotation(id, data) {
    const res = await apiFetch(`/quotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Delete quotation
  async deleteQuotation(id) {
    const res = await apiFetch(`/quotations/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Update status
  async updateStatus(id, status) {
    const res = await apiFetch(`/quotations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Duplicate quotation
  async duplicateQuotation(id) {
    const res = await apiFetch(`/quotations/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return res.json();
  },

  // Convert quotation
  async convertQuotation(id, options = {}) {
    const res = await apiFetch(`/quotations/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json();
  },

  // Send quotation
  async sendQuotation(id, data) {
    const res = await apiFetch(`/quotations/${id}/send`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Add note to quotation
  async addNote(id, text) {
    const res = await apiFetch(`/quotations/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  // Get quotations by lead
  async getLeadQuotations(leadId) {
    return apiJson(`/quotations?leadId=${leadId}`);
  },
};
