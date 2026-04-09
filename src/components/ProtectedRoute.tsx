import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

const C = { navy: '#0F1E2E', mustard: '#C97D2E', canvas: '#F4F5F7', t3: '#9CA3AF' };

interface Props { children: ReactNode }

export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: C.canvas,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "system-ui, sans-serif",
        gap: 16,
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Georgia, serif" }}>
          <span style={{ color: C.navy }}>Counsel</span>
          <span style={{ color: C.mustard }}>Works</span>
        </div>
        <div style={{ fontSize: 12, color: C.t3 }}>Loading…</div>
      </div>
    );
  }

  if (!user) {
    // App.tsx handles routing to LoginPage based on auth state
    return null;
  }

  return <>{children}</>;
}
