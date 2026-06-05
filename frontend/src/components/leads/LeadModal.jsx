import React, { useState, useEffect } from 'react';
import { X, User, Phone, Building2, MapPin, FileText, Calendar } from 'lucide-react';
import { STATUS_OPTIONS } from "../ui/StatusBadge";

const INITIAL_FORM = {
  customerName: '',
  phone: '',
  company: '',
  city: '',
  inquiry: '',
  status: 'New',
  followUpDate: '',
  email: '',
  notes: '',
};

const LeadModal = ({ isOpen, onClose, onSave, lead = null }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(lead);

  useEffect(() => {
    if (lead) {
      setForm({
        customerName: lead.customerName || '',
        phone: lead.phone || '',
        company: lead.company || '',
        city: lead.city || '',
        inquiry: lead.inquiry || '',
        status: lead.status || 'New',
        followUpDate: lead.followUpDate ? lead.followUpDate.split('T')[0] : '',
        email: lead.email || '',
        notes: lead.notes || '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [lead, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (form.phone && !/^\d{10}$/.test(form.phone.trim())) errs.phone = 'Enter valid 10-digit number';
    if (!form.company.trim()) errs.company = 'Company is required';
    if (!form.inquiry.trim()) errs.inquiry = 'Inquiry is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl shadow-card animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div>
            <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{isEdit ? 'Update lead information' : 'Fill in the details to create a new lead'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-xl text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                <span className="flex items-center gap-1"><User size={11} /> Customer Name *</span>
              </label>
              <input name="customerName" value={form.customerName} onChange={handleChange}
                className={`input-field ${errors.customerName ? 'border-red-500' : ''}`}
                placeholder="e.g. Rajesh Kumar" />
              {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                <span className="flex items-center gap-1"><Phone size={11} /> Phone Number *</span>
              </label>
              <input name="phone" value={form.phone} onChange={handleChange} type="tel"
                className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="10-digit number" />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                <span className="flex items-center gap-1"><Building2 size={11} /> Company *</span>
              </label>
              <input name="company" value={form.company} onChange={handleChange}
                className={`input-field ${errors.company ? 'border-red-500' : ''}`}
                placeholder="Company name" />
              {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                <span className="flex items-center gap-1"><MapPin size={11} /> City</span>
              </label>
              <input name="city" value={form.city} onChange={handleChange}
                className="input-field" placeholder="e.g. Mumbai" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input name="email" value={form.email} onChange={handleChange} type="email"
                className="input-field" placeholder="email@company.com" />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                Status
              </label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Inquiry */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                <span className="flex items-center gap-1"><FileText size={11} /> Inquiry / Product *</span>
              </label>
              <input name="inquiry" value={form.inquiry} onChange={handleChange}
                className={`input-field ${errors.inquiry ? 'border-red-500' : ''}`}
                placeholder="e.g. Cotton Fabric Bulk Order" />
              {errors.inquiry && <p className="text-red-400 text-xs mt-1">{errors.inquiry}</p>}
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                <span className="flex items-center gap-1"><Calendar size={11} /> Follow-up Date</span>
              </label>
              <input name="followUpDate" value={form.followUpDate} onChange={handleChange} type="date"
                className="input-field" />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                Notes
              </label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                className="input-field resize-none" placeholder="Any additional notes about this lead..." />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-end gap-3 border-t border-surface-border pt-4">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary min-w-[120px] justify-center">
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Saving...
                </span>
              ) : isEdit ? 'Update Lead' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
