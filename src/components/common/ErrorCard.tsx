/**
 * ErrorCard — surface API / loading errors without crashing the page.
 * Red left border, neutral background, optional "Try again" button.
 */
import React from 'react';

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div
      role="alert"
      style={{
        background: 'var(--surface-card)',
        borderLeft: '4px solid var(--red)',
        border: '1px solid var(--border)',
        borderLeftWidth: 4,
        borderRadius: 6,
        padding: '16px 20px',
        margin: '16px 0',
        color: 'var(--text-1)',
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--red)',
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
        {message}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: 12,
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '6px 12px',
            fontSize: 13,
            color: 'var(--text-1)',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorCard;
