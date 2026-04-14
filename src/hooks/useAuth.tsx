/**
 * src/hooks/useAuth.tsx
 *
 * Auth context — wraps the entire app. On mount, calls GET /auth/me to
 * check for an existing session cookie. Provides login/logout and the
 * current user + active firm/role.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  type AuthUser,
} from '../api/authApi';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Primary firm ID derived from user memberships */
  activeFirmId: string | null;
  /** User's role in the active firm */
  activeRole: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if we have a valid session
  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        // No session — that's fine, show login
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  // Resolve active firm from memberships
  const primaryMembership =
    user?.memberships?.find((m) => m.isPrimary) ?? user?.memberships?.[0] ?? null;

  const value: AuthContextValue = {
    user,
    loading,
    login,
    logout,
    activeFirmId: primaryMembership?.firmId ?? null,
    activeRole: primaryMembership?.role ?? null,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
