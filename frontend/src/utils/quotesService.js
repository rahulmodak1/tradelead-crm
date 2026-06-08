/**
 * quotesService.js
 * All API calls for the Quotation module.
 *
 * Uses the same axios instance your project already has (auth token pre-injected).
 * ⚠️  Only change needed: match the import path to YOUR existing axios instance.
 *     Common paths in this project style:
 *       import api from './api';          ← most likely
 *       import api from '../utils/api';
 *       import axios from '../config/axios';
 */
import api from './api';

const BASE = '/quotations';

const quotesService = {
  /**
   * List quotations
   * @param {{ status?, lead?, page?, limit? }} params
   * @returns {{ quotations, total, page, pages }}
   */
  getAll: (params = {}) =>
    api.get(BASE, { params }).then((r) => r.data),

  /** Single quotation */
  getById: (id) =>
    api.get(`${BASE}/${id}`).then((r) => r.data),

  /**
   * Create quotation
   * @param {{ lead, items, notes?, status?, validUntil? }} payload
   */
  create: (payload) =>
    api.post(BASE, payload).then((r) => r.data),

  /** Full update */
  update: (id, payload) =>
    api.put(`${BASE}/${id}`, payload).then((r) => r.data),

  /**
   * Status-only update
   * @param {'Draft'|'Sent'|'Accepted'|'Rejected'|'Expired'} status
   */
  updateStatus: (id, status) =>
    api.patch(`${BASE}/${id}/status`, { status }).then((r) => r.data),

  /** Delete */
  remove: (id) =>
    api.delete(`${BASE}/${id}`).then((r) => r.data),
};

export default quotesService;
