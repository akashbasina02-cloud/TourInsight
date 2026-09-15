const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'tourinsight.auth.token';

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}

function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable */ }
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body != null) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(API_BASE + path, { ...options, headers, credentials: 'include' });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error((data && (data.error || data.message)) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function encodeQuery(query) {
  return encodeURIComponent(JSON.stringify(query || {}));
}

function entityApi(name) {
  return {
    async list(sort = '-created_date', limit = 50) {
      return request(`/api/entities/${name}?sort=${encodeURIComponent(sort || '')}&limit=${Number(limit) || 50}`);
    },
    async get(id) {
      return request(`/api/entities/${name}/${encodeURIComponent(id)}`);
    },
    async filter(query = {}, sort = '', limit = 200) {
      return request(`/api/entities/${name}?filter=${encodeQuery(query)}&sort=${encodeURIComponent(sort || '')}&limit=${Number(limit) || 200}`);
    },
    async create(data) {
      return request(`/api/entities/${name}`, { method: 'POST', body: JSON.stringify(data || {}) });
    },
    async bulkCreate(records) {
      return request(`/api/entities/${name}/bulk`, { method: 'POST', body: JSON.stringify({ records: records || [] }) });
    },
    async update(id, data) {
      return request(`/api/entities/${name}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data || {}) });
    },
    async bulkUpdate(records) {
      return request(`/api/entities/${name}/bulk-update`, { method: 'PATCH', body: JSON.stringify({ records: records || [] }) });
    },
    async delete(id) {
      return request(`/api/entities/${name}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
    async deleteMany(query = {}) {
      return request(`/api/entities/${name}/delete-many`, { method: 'POST', body: JSON.stringify({ query }) });
    },
  };
}

const entities = new Proxy({}, {
  get(target, prop) {
    if (typeof prop !== 'string') return undefined;
    if (!target[prop]) target[prop] = entityApi(prop);
    return target[prop];
  },
});

export const appClient = {
  auth: {
    async me() { return request('/api/auth/me'); },
    async isAuthenticated() {
      try { await request('/api/auth/me'); return true; } catch { return false; }
    },
    async loginViaEmailPassword(email, password) {
      const data = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      if (data?.access_token) setToken(data.access_token);
      return data;
    },
    loginWithProvider(provider, returnTo = '/') {
      setToken('');
      window.location.href = `${API_BASE}/api/auth/${encodeURIComponent(provider)}?returnTo=${encodeURIComponent(returnTo || '/')}`;
    },
    redirectToLogin(returnTo = '/') {
      window.location.href = `/login${returnTo && returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
    },
    async register(payload) { return request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload || {}) }); },
    async verifyOtp(payload) {
      const data = await request('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload || {}) });
      if (data?.access_token) setToken(data.access_token);
      return data;
    },
    async resendOtp(email) { return request('/api/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }); },
    async resetPasswordRequest(email) { return request('/api/auth/request-password-reset', { method: 'POST', body: JSON.stringify({ email }) }); },
    async resetPassword(payload) { return request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(payload || {}) }); },
    setToken,
    async logout(redirectTo = '/') {
      try { await request('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
      setToken('');
      if (redirectTo !== false) window.location.href = typeof redirectTo === 'string' ? redirectTo : '/';
    },
  },
  app: {
    async getPublicSettings() { return request('/api/app/settings'); },
  },
  entities,
  functions: {
    async invoke(name, payload) {
      const data = await request(`/api/functions/${encodeURIComponent(name)}`, { method: 'POST', body: JSON.stringify(payload || {}) });
      return { data };
    },
  },
};

export default appClient;
