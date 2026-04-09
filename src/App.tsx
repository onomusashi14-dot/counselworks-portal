/**
 * src/App.tsx
 *
 * Entry point. Provides AuthContext, routes between LoginPage and portal.
 * Routing is driven entirely by auth state — never by window.location reloads.
 */

import { useEffect } from 'react';
import { AuthContext, useAuthState } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Portal } from './pages/Portal';

export default function App() {
  const auth = useAuthState();

  // Keep URL bar in sync with auth state (cosmetic only — no page reload)
  useEffect(() => {
    if (auth.loading) return;
    if (auth.user && window.location.pathname === '/login') {
      history.replaceState(null, '', '/');
    } else if (!auth.user && window.location.pathname !== '/login') {
      history.replaceState(null, '', '/login');
    }
  }, [auth.user, auth.loading]);

  // Route based on auth state, not URL
  if (auth.loading) {
    return null; // ProtectedRoute already shows a loading spinner
  }

  if (!auth.user) {
    return (
      <AuthContext.Provider value={auth}>
        <LoginPage />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <ProtectedRoute>
        <Portal />
      </ProtectedRoute>
    </AuthContext.Provider>
  );
}
