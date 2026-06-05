import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle2, Loader2, MessageSquarePlus } from 'lucide-react';

const FollowUpSection = ({
  lead,
  onSetFollowUp,
  onCompleteFollowUp,
  onAddNote,
}) => {
  const [followUpDate, setFollowUpDate] = useState(
    lead.followUpDate ? lead.followUpDate.split('T')[0] : ''
  );
  const [noteText, setNoteText] = useState('');
  const [savingDate, setSavingDate] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    setFollowUpDate(lead.followUpDate ? lead.followUpDate.split('T')[0] : '');
  }, [lead.followUpDate, lead._id]);

  const history = [...(lead.followUpHistory || [])].sort(
    (a, b) => new Date(b.createdAt || b.scheduledDate) - new Date(a.createdAt || a.scheduledDate)
  );

  const handleSaveFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpDate) return;
    setSavingDate(true);
    try {
      await onSetFollowUp(followUpDate, noteText);
      setNoteText('');
    } finally {
      setSavingDate(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await onAddNote(noteText.trim());
      setNoteText('');
    } finally {
      setSavingNote(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onCompleteFollowUp();
    } finally {
      setCompleting(false);
    }
  };

  const hasPendingFollowUp = history.some(f => !f.completed) || (lead.followUpDate && !history.some(f => !f.completed && new Date(f.scheduledDate).toDateString() === new Date(lead.followUpDate).toDateString()));

  return (
    <div className="space-y-5">
      {/* Next follow-up */}
      <form onSubmit={handleSaveFollowUp} className="space-y-3">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Next Follow-up Date
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={!followUpDate || savingDate}
            className="btn-primary justify-center sm:min-w-[120px] disabled:opacity-50"
          >
            {savingDate ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
            Save Date
          </button>
        </div>
      </form>

      {/* Add note */}
      <form onSubmit={handleAddNote} className="space-y-3">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Add Note
        </label>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
          placeholder="Write a follow-up note..."
          className="input-field resize-none"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={!noteText.trim() || savingNote}
            className="btn-primary justify-center flex-1 disabled:opacity-50"
          >
            {savingNote ? <Loader2 size={14} className="animate-spin" /> : <MessageSquarePlus size={14} />}
            Add Note
          </button>
          {hasPendingFollowUp && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={completing}
              className="btn-ghost justify-center border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 flex-1 disabled:opacity-50"
            >
              {completing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Mark Complete
            </button>
          )}
        </div>
      </form>

      {/* Follow-up history */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Clock size={12} /> Follow-up History
        </h4>
        {history.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-4 bg-surface-hover rounded-xl border border-surface-border">
            No follow-up history yet
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item._id || item.scheduledDate}
                className={`p-3 rounded-xl border ${
                  item.completed
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-surface-hover border-surface-border'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Calendar size={11} className="text-gray-500" />
                    {format(new Date(item.scheduledDate), 'dd MMM yyyy')}
                  </span>
                  {item.completed ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Completed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Pending
                    </span>
                  )}
                </div>
                {item.note && (
                  <p className="text-xs text-gray-500 leading-relaxed">{item.note}</p>
                )}
                {item.completedAt && (
                  <p className="text-[10px] text-gray-600 mt-1">
                    Completed {format(new Date(item.completedAt), 'dd MMM yyyy, h:mm a')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note history */}
      {((lead.noteHistory?.length > 0) || lead.notes) && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Notes
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {[...(lead.noteHistory || [])]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((note) => (
                <div
                  key={note._id || note.createdAt}
                  className="p-3 rounded-xl bg-surface-hover border border-surface-border"
                >
                  <p className="text-xs text-gray-400 leading-relaxed">{note.text}</p>
                  <p className="text-[10px] text-gray-600 mt-1.5">
                    {format(new Date(note.createdAt), 'dd MMM yyyy, h:mm a')}
                  </p>
                </div>
              ))}
            {lead.noteHistory?.length === 0 && lead.notes && (
              <div className="p-3 rounded-xl bg-surface-hover border border-surface-border">
                <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
                <p className="text-[10px] text-gray-600 mt-1.5">Legacy note</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpSection;
