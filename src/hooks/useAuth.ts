/**
 * src/hooks/useAuth.ts
 *
 * Active firm/role derived from isPrimary membership first, then first fallback.
 * Never relies on array index order alone.
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authApi, User } from '../api/auth';
import { ApiError, setOnAuthFailure } from '../api/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  activeFirmId: string | null;
  activeRole: string | null;
  activeFirmName: string | null;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null, loading: true, error: null,
  login: async () => {}, logout: async () => {},
  activeFirmId: null, activeRole: null, activeFirmName: null,
});

// FIX 5: resolve active membership using isPrimary first, fall back to [0]
function resolveActiveMembership(user: User | null) {
  if (!user?.memberships?.length) return null;
  return (
    user.memberships.find(m => m.isPrimary) ??
    user.memberships[0]
  );
}

export function useAuthState(): AuthContextValue {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  useEffect(() => {
    // Register callback so API layer can force-logout on unrecoverable 401
    setOnAuthFailure(() => setState({ user: null, loading: false, error: null }));

    authApi.me()
      .then(({ user }) => setState({ user, loading: false, error: null }))
      .catch(() => setState({ user: null, loading: false, error: null }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { user } = await authApi.login(email, password);
      setState({ user, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
      setState({ user: null, loading: false, error: msg });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setState({ user: null, loading: false, error: null });
    // No window.location — App.tsx re-renders to LoginPage on state change
  }, []);

  const activeMembership = resolveActiveMembership(state.user);

  return {
    ...state,
    login,
    logout,
    activeFirmId:   activeMembership?.firmId   ?? null,
    activeRole:     activeMembership?.role      ?? null,
    activeFirmName: activeMembership?.firm?.name ?? null,
  };
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
