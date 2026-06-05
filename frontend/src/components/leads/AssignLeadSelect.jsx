import React, { useState } from 'react';
import { UserCheck, Loader2 } from 'lucide-react';

const AssignLeadSelect = ({
  lead,
  users = [],
  onAssign,
  compact = false,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const userId = e.target.value;
    if (!userId) return;
    setLoading(true);
    try {
      await onAssign(lead._id || lead.id, userId);
    } finally {
      setLoading(false);
      e.target.value = lead.assignedTo || '';
    }
  };

  if (compact) {
    return (
      <select
        defaultValue={lead.assignedTo || ''}
        onChange={handleChange}
        disabled={disabled || loading}
        className="input-field text-xs py-1.5 px-2 min-w-[120px] max-w-[160px]"
        onClick={(e) => e.stopPropagation()}
      >
        <option value="">Assign…</option>
        {users.map(u => (
          <option key={u._id} value={u._id}>{u.name}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
        {loading ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
        Assigned To
      </label>
      <select
        defaultValue={lead.assignedTo || ''}
        onChange={handleChange}
        disabled={disabled || loading}
        className="input-field"
      >
        <option value="">Unassigned</option>
        {users.map(u => (
          <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
        ))}
      </select>
      {lead.assignedToName && (
        <p className="text-xs text-gray-500">Currently: <span className="text-gray-300">{lead.assignedToName}</span></p>
      )}
    </div>
  );
};

export default AssignLeadSelect;
