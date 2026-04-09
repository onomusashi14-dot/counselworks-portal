/**
 * src/api/client.ts
 *
 * Central API client.
 *
 * 401 handling — silent refresh with retry:
 *   1. On 401: attempt POST /auth/refresh
 *   2. If refresh succeeds: retry the original request once
 *   3. If refresh fails: clear state + redirect to /login
 *
 * No Authorization header. Cookie-based auth only.
 * No localStorage anywhere.
 */

export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Tracks an in-flight refresh to avoid parallel refresh attempts
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(r => r.ok)
    .catch(() => false)
    .finally(() => { refreshPromise = null; });

  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  if (res.status === 401) {
    if (!isRetry) {
      // Attempt silent refresh, then retry the original request once
      const refreshed = await attemptRefresh();
      if (refreshed) {
        return request<T>(path, options, true); // retry once
      }
    }
    // Refresh failed or already retried — redirect to login
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
