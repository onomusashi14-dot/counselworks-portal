/**
 * src/components/auth/LoginPage.tsx
 *
 * Full-screen login form. Matches the portal design system:
 * navy + mustard + white cards, no gradients, no shadows.
 */

import { useState, type FormEvent } from 'react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--canvas)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 380, padding: '0 20px' }}>
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 32,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'var(--mustard)',
              color: 'var(--white)',
              fontWeight: 800,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            CW
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--navy)',
              fontFamily: 'var(--font-display)',
            }}
          >
            CounselWorks
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '32px 28px',
          }}
        >
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-1)',
              margin: '0 0 4px',
            }}
          >
            Sign in
          </h1>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-2)',
              margin: '0 0 24px',
            }}
          >
            Enter your credentials to access the portal.
          </p>

          {error && (
            <div
              style={{
                background: 'rgba(220, 38, 38, 0.06)',
                borderLeft: '3px solid var(--red)',
                padding: '10px 14px',
                borderRadius: 4,
                marginBottom: 20,
                fontSize: 13,
                color: 'var(--red)',
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-2)',
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              placeholder="you@firm.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '1px solid var(--border)',
                borderRadius: 6,
                outline: 'none',
                marginBottom: 16,
                color: 'var(--text-1)',
                background: 'var(--white)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--mustard)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />

            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-2)',
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '1px solid var(--border)',
                borderRadius: 6,
                outline: 'none',
                marginBottom: 24,
                color: 'var(--text-1)',
                background: 'var(--white)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--mustard)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '11px 0',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--white)',
                background: submitting ? 'var(--text-3)' : 'var(--navy)',
                border: 'none',
                borderRadius: 6,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!submitting)
                  e.currentTarget.style.background = 'var(--navy-2)';
              }}
              onMouseLeave={(e) => {
                if (!submitting)
                  e.currentTarget.style.background = 'var(--navy)';
              }}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--text-3)',
            marginTop: 20,
            lineHeight: 1.5,
          }}
        >
          CounselWorks provides administrative support services only.
          <br />
          This portal is not a source of legal advice.
        </p>
      </div>
    </div>
  );
}
