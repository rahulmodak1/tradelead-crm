import React, { useState } from 'react';
import { UserCheck, Loader2, X } from 'lucide-react';

const BulkAssignBar = ({ selectedCount, users, onAssign, onClear }) => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await onAssign(userId);
      setUserId('');
    } finally {
      setLoading(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 bg-brand-500/10 border border-brand-500/25 rounded-xl animate-fade-in">
      <p className="text-sm text-brand-300 font-semibold flex-1">
        {selectedCount} lead{selectedCount > 1 ? 's' : ''} selected
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="input-field w-auto min-w-[160px] text-sm py-2"
        >
          <option value="">Assign to…</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
        <button
          onClick={handleAssign}
          disabled={!userId || loading}
          className="btn-primary py-2 disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
          Assign
        </button>
        <button onClick={onClear} className="btn-ghost py-2">
          <X size={14} /> Clear
        </button>
      </div>
    </div>
  );
};

export default BulkAssignBar;
