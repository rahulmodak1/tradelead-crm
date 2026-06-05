import {
  useState, useEffect, useCallback, createContext, useContext,
} from 'react';
import { apiJson, setToken, getToken } from '../utils/apiClient';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [error, setError] = useState(null);

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser));
    else localStorage.removeItem('user');
  }, []);

  const fetchMe = useCallback(async () => {
    if (!getToken()) {
      persistUser(null);
      setLoading(false);
      return null;
    }
    try {
      const me = await apiJson('/auth/me');
      persistUser(me);
      setError(null);
      return me;
    } catch (err) {
      persistUser(null);
      setToken(null);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [persistUser]);

  useEffect(() => {
    if (getToken()) fetchMe();
    else setLoading(false);
  }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    setError(null);
    const data = await apiJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    persistUser(data.user);
    return data.user;
  }, [persistUser]);

  const logout = useCallback(() => {
    setToken(null);
    persistUser(null);
  }, [persistUser]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      fetchMe,
      isAuthenticated: Boolean(user && getToken()),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { AuthProvider, useAuth };
