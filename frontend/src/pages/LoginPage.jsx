import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Zap, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('admin@tradeindia.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TradeIndia CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your leads & team</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-4 shadow-card"
        >
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-[11px] text-gray-600 text-center pt-2">
            Default admin: admin@tradeindia.com / admin123
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
