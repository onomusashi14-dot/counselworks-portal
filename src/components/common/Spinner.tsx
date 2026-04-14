/**
 * Spinner — minimal loading indicator.
 * Uses design tokens (var(--mustard), var(--border)) so it matches the rest
 * of the design system. Size is controlled by the `size` prop (default 24px).
 */
import React from 'react';

interface SpinnerProps {
  size?: number;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 24, label = 'Loading…' }) => {
  const border = Math.max(2, Math.round(size / 10));
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        color: 'var(--text-2)',
        fontSize: 14,
      }}
    >
      <style>{`
        @keyframes cw-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          border: `${border}px solid var(--border)`,
          borderTopColor: 'var(--mustard)',
          borderRadius: '50%',
          animation: 'cw-spin 0.9s linear infinite',
        }}
      />
      <span>{label}</span>
    </div>
  );
};

export default Spinner;
