/**
 * src/api/authApi.ts
 *
 * Auth endpoints — login, logout, check session.
 * Uses httpOnly cookies (credentials: 'include') — no token management needed.
 * The backend sets/clears cw_session and cw_refresh cookies automatically.
 */

import { AUTH_BASE } from '../config';

export interface Membership {
  firmId: string;
  role: string;
  isPrimary: boolean;
  firm?: { id: string; name: string; slug: string };
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  memberships: Membership[];
}

export class AuthError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
  }
}

/**
 * POST /auth/login — exchange email + password for a session.
 * The backend sets httpOnly cookies on success.
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const res = await fetch(`${AUTH_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new AuthError(
      body?.error?.message ?? 'Login failed.',
      res.status,
      body?.error?.code,
    );
  }

  return body.data.user as AuthUser;
}

/**
 * GET /auth/me — check current session.
 * Returns the authenticated user or throws if not logged in.
 */
export async function getMe(): Promise<AuthUser> {
  const res = await fetch(`${AUTH_BASE}/auth/me`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new AuthError('Not authenticated.', res.status, 'UNAUTHENTICATED');
  }

  const body = await res.json();
  return body.data.user as AuthUser;
}

/**
 * POST /auth/logout — clear session server-side + cookies.
 */
export async function logout(): Promise<void> {
  await fetch(`${AUTH_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {});
}

/**
 * POST /auth/refresh — rotate refresh token for a new session.
 */
export async function refresh(): Promise<void> {
  const res = await fetch(`${AUTH_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new AuthError('Session expired.', res.status, 'TOKEN_INVALID');
  }
}
