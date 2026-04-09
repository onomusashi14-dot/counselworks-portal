/**
 * src/App.tsx
 *
 * Entry point. Provides AuthContext, routes between LoginPage and portal.
 * All mock state replaced with real API hooks.
 */

import { useState } from 'react';
import { AuthContext, useAuthState } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Portal } from './pages/Portal';

export default function App() {
  const auth = useAuthState();

  // Route: if no user and not loading → show login
  if (!auth.loading && !auth.user) {
    // Check path to avoid redirect loop
    if (window.location.pathname !== '/login') {
      window.location.pathname = '/login';
      return null;
    }
  }

  if (window.location.pathname === '/login') {
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
