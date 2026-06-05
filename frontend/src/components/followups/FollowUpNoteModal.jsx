import React, { useEffect, useState } from 'react';
import { Loader2, MessageSquareText, X } from 'lucide-react';

const INITIAL = {
  discussionSummary: '',
  requirementUpdate: '',
  nextAction: '',
  quotationSent: false,
  sampleRequired: false,
};

const FollowUpNoteModal = ({
  isOpen,
  onClose,
  onSave,
  lead,
  title = 'Add Follow-up Note',
  submitLabel = 'Save Note',
}) => {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL);
      setError(null);
    }
  }, [isOpen, lead?._id]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save follow-up note');
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
              <MessageSquareText size={18} className="text-brand-400" />
              {title}
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

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Discussion Summary
            </label>
            <textarea
              value={form.discussionSummary}
              onChange={(e) => updateField('discussionSummary', e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="What was discussed with the buyer?"
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
              placeholder="Packaging type, quantity, size, material, printing, delivery details..."
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
              placeholder="Call again, send quotation, arrange sample..."
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
              {saving ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowUpNoteModal;
