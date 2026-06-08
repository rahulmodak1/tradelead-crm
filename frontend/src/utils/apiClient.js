const API_BASE = 'https://tradeleadcrm-backend.onrender.com/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    setToken(null);
    localStorage.removeItem('user');
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired');
  }

  return res;
}

export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Error ${res.status}`);
  }
  return data;
}

export { API_BASE };
