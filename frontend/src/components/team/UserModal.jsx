import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Shield, Loader2 } from 'lucide-react';
import { ROLES } from '../../utils/permissions';

const INITIAL = {
  name: '',
  mobile: '',
  email: '',
  role: 'Sales Executive',
  status: 'Active',
  password: '',
};

const UserModal = ({ isOpen, onClose, onSave, user = null }) => {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(user);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        mobile: user.mobile || '',
        email: user.email || '',
        role: user.role || 'Sales Executive',
        status: user.status || 'Active',
        password: '',
      });
    } else {
      setForm(INITIAL);
    }
    setErrors({});
  }, [user, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.mobile.trim()) errs.mobile = 'Mobile is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!isEdit && !form.password.trim()) errs.password = 'Password is required';
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
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      await onSave(payload);
      onClose();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg shadow-card animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div>
            <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Team Member' : 'Add Team Member'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage user role and access</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-xl text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errors.form && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{errors.form}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              <span className="flex items-center gap-1"><User size={11} /> Name *</span>
            </label>
            <input name="name" value={form.name} onChange={handleChange} className={`input-field ${errors.name ? 'border-red-500' : ''}`} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                <span className="flex items-center gap-1"><Phone size={11} /> Mobile *</span>
              </label>
              <input name="mobile" value={form.mobile} onChange={handleChange} className={`input-field ${errors.mobile ? 'border-red-500' : ''}`} />
              {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                <span className="flex items-center gap-1"><Mail size={11} /> Email *</span>
              </label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={`input-field ${errors.email ? 'border-red-500' : ''}`} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                <span className="flex items-center gap-1"><Shield size={11} /> Role</span>
              </label>
              <select name="role" value={form.role} onChange={handleChange} className="input-field">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Password {isEdit ? '(leave blank to keep)' : '*'}
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={`input-field ${errors.password ? 'border-red-500' : ''}`}
              placeholder={isEdit ? '••••••••' : 'Min 6 characters'}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary min-w-[120px] justify-center">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
