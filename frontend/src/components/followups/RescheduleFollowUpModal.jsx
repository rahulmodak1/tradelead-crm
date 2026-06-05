import React, { useEffect, useState } from 'react';
import { CalendarClock, Loader2, X } from 'lucide-react';

const INITIAL = {
  followUpDate: '',
  reminderAt: '',
  discussionSummary: '',
  requirementUpdate: '',
  nextAction: '',
  quotationSent: false,
  sampleRequired: false,
};

const RescheduleFollowUpModal = ({ isOpen, onClose, onSave, lead }) => {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        ...INITIAL,
        followUpDate: lead?.followUpDate ? lead.followUpDate.split('T')[0] : '',
      });
      setError(null);
    }
  }, [isOpen, lead]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.followUpDate) {
      setError('Next follow-up date is required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reschedule follow-up');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-card border border-surface-border rounded-2xl w-full max-w-xl shadow-card animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarClock size={18} className="text-brand-400" />
              Reschedule Follow-up
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{lead?.customerName}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-surface-hover rounded-xl text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => updateField('followUpDate', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                Reminder Date
              </label>
              <input
                type="date"
                value={form.reminderAt}
                onChange={(e) => updateField('reminderAt', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Discussion Summary
            </label>
            <textarea
              value={form.discussionSummary}
              onChange={(e) => updateField('discussionSummary', e.target.value)}
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Requirement Update
            </label>
            <textarea
              value={form.requirementUpdate}
              onChange={(e) => updateField('requirementUpdate', e.target.value)}
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Next Action
            </label>
            <input
              value={form.nextAction}
              onChange={(e) => updateField('nextAction', e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-between gap-3 bg-surface-hover border border-surface-border rounded-xl px-4 py-3 text-sm text-gray-300">
              <span>Quotation Sent</span>
              <input
                type="checkbox"
                checked={form.quotationSent}
                onChange={(e) => updateField('quotationSent', e.target.checked)}
                className="rounded border-surface-border bg-surface text-brand-500 focus:ring-brand-500/30"
              />
            </label>
            <label className="flex items-center justify-between gap-3 bg-surface-hover border border-surface-border rounded-xl px-4 py-3 text-sm text-gray-300">
              <span>Sample Required</span>
              <input
                type="checkbox"
                checked={form.sampleRequired}
                onChange={(e) => updateField('sampleRequired', e.target.checked)}
                className="rounded border-surface-border bg-surface text-brand-500 focus:ring-brand-500/30"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary min-w-[130px] justify-center">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? 'Saving...' : 'Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleFollowUpModal;
