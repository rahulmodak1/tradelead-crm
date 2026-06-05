import React, { useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../hooks/useAuth';
import { canManageTeam } from '../utils/permissions';
import { roleBadgeClass } from '../utils/permissions';
import UserModal from '../components/team/UserModal';
import TeamPerformanceCard from '../components/team/TeamPerformanceCard';

const TeamPage = () => {
  const { user } = useAuth();
  const {
    users, teamStats, loading, error, refreshTeam,
    createUser, updateUser, deleteUser,
  } = useTeam();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const isAdmin = canManageTeam(user);

  const handleSave = async (formData) => {
    if (editingUser) {
      await updateUser(editingUser._id, formData);
    } else {
      await createUser(formData);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the team?`)) return;
    try {
      await deleteUser(id);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4 lg:p-6">
        <TeamPerformanceCard
          stats={teamStats}
          loading={loading}
          title="My Performance"
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield size={20} className="text-brand-400" />
            Team Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading…' : `${users.length} team members`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refreshTeam} className="btn-ghost">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { setEditingUser(null); setModalOpen(true); }} className="btn-primary">
            <Plus size={14} /> Add Member
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-400">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      <TeamPerformanceCard stats={teamStats} loading={loading} />

      <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-bold text-white text-sm">Team Members</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-surface-border text-[11px] uppercase tracking-widest text-gray-500">
                  <th className="text-left px-5 py-3 font-bold">Name</th>
                  <th className="text-left px-4 py-3 font-bold">Mobile</th>
                  <th className="text-left px-4 py-3 font-bold">Email</th>
                  <th className="text-left px-4 py-3 font-bold">Role</th>
                  <th className="text-left px-4 py-3 font-bold">Status</th>
                  <th className="text-right px-5 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {users.map((member) => (
                  <tr key={member._id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600/30 to-brand-900/30 border border-brand-500/15 flex items-center justify-center">
                          <span className="text-brand-400 font-bold text-xs">{member.name?.charAt(0)}</span>
                        </div>
                        <span className="font-semibold text-gray-200">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">{member.mobile}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs">{member.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${roleBadgeClass(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                        member.status === 'Active'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                          : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingUser(member); setModalOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-500 hover:text-white"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        {member._id !== user._id && (
                          <button
                            onClick={() => handleDelete(member._id, member.name)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={editingUser}
      />
    </div>
  );
};

export default TeamPage;
