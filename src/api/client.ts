/**
 * src/api/client.ts
 *
 * Central API client — Bearer token auth (in-memory).
 *
 * Tokens are stored in module-scoped variables, NOT localStorage.
 * They survive within a single page session and are cleared on refresh/close.
 *
 * 401 handling — silent refresh with retry:
 *   1. On 401: attempt POST /auth/refresh with refreshToken in body
 *   2. If refresh succeeds: store new tokens, retry the original request once
 *   3. If refresh fails: clear state + redirect to /login
 */

export const API_BASE = import.meta.env.VITE_API_URL ?? '';

// ─── IN-MEMORY TOKEN STORE ──────────────────────────────────────────────────
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export function setTokens(access: string, refresh: string): void {
  _accessToken = access;
  _refreshToken = refresh;
}

export function clearTokens(): void {
  _accessToken = null;
  _refreshToken = null;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ─── ERROR CLASS ────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── REFRESH LOGIC ──────────────────────────────────────────────────────────
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (!_refreshToken) return false;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: _refreshToken }),
      });

      if (!res.ok) return false;

      const body = await res.json();
      if (body.ok && body.data?.accessToken && body.data?.refreshToken) {
        setTokens(body.data.accessToken, body.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── CORE REQUEST ───────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  // Attach Bearer token if available
  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (!isRetry) {
      const refreshed = await attemptRefresh();
      if (refreshed) {
        return request<T>(path, options, true);
      }
    }
    // Refresh failed or already retried — redirect to login
    clearTokens();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body?.error?.code ?? 'UNAUTHENTICATED',
      body?.error?.message ?? 'Authentication required.',
      401
    );
  }

  const body = await res.json();
  if (!res.ok || !body.ok) {
    throw new ApiError(
      body?.error?.code ?? 'UNKNOWN',
      body?.error?.message ?? 'An unexpected error occurred.',
      res.status
    );
  }
  return body.data as T;
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────────
export const api = {
  get:    <T>(path: string)                 => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, data?: unknown) => request<T>(path, { method: 'POST',  body: JSON.stringify(data) }),
  patch:  <T>(path: string, data?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(path: string)                 => request<T>(path, { method: 'DELETE' }),

  // S3 direct upload — XHR with progress, no auth header
  uploadToS3: (uploadUrl: string, file: File, onProgress?: (pct: number) => void): Promise<void> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
        };
      }
      xhr.onload  = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('S3 upload failed'));
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    }),
};
