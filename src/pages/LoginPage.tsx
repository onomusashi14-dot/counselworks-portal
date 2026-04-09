import { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

const C = {
  navy: '#0F1E2E', mustard: '#C97D2E', canvas: '#F4F5F7',
  white: '#FFFFFF', t1: '#111827', t2: '#6B7280', t3: '#9CA3AF',
  border: '#E2E5EA', red: '#DC2626', redBg: 'rgba(220,38,38,.09)',
};

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.canvas,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    }}>
      <div style={{ width: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia, serif" }}>
            <span style={{ color: C.navy }}>Counsel</span>
            <span style={{ color: C.mustard }}>Works</span>
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>Client Portal</div>
        </div>

        {/* Form card */}
        <div style={{
          background: C.white, border: `1px solid ${C.border}`,
          borderRadius: 6, padding: 32,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 24 }}>
            Sign in to your account
          </div>

          {error && (
            <div style={{
              background: C.redBg, border: `1px solid ${C.red}30`,
              borderLeft: `4px solid ${C.red}`, borderRadius: 4,
              padding: '10px 14px', marginBottom: 20,
              fontSize: 13, color: C.red,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
                style={{
                  width: '100%', padding: '9px 12px',
                  border: `1px solid ${C.border}`, borderRadius: 4,
                  fontSize: 13, color: C.t1, background: C.white,
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
                style={{
                  width: '100%', padding: '9px 12px',
                  border: `1px solid ${C.border}`, borderRadius: 4,
                  fontSize: 13, color: C.t1, background: C.white,
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                width: '100%', padding: '10px 0',
                background: loading ? '#D4956A' : C.mustard,
                color: C.white, border: 'none', borderRadius: 4,
                fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: C.t3 }}>
          CounselWorks provides administrative support services only.
          This portal is not a source of legal advice.
        </div>
      </div>
    </div>
  );
}
