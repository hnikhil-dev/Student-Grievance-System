import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { colors, typography, radii } from '../../tokens';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: React.CSSProperties;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Interruption',
  message,
  onRetry,
  retryLabel = 'Retry Request',
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: '#FCF5F4',
        border: `1px solid #ECC7C4`,
        borderRadius: radii.lg,
        fontFamily: typography.fontFamily,
        maxWidth: '520px',
        margin: '1.5rem auto',
        ...style,
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: radii.full,
          backgroundColor: '#FAECEB',
          color: colors.danger,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <AlertTriangle size={22} color={colors.danger} />
      </div>

      <h4
        style={{
          margin: '0 0 0.35rem 0',
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.semibold,
          color: colors.danger,
        }}
      >
        {title}
      </h4>

      <p
        style={{
          margin: '0 0 1.25rem 0',
          fontSize: typography.fontSize.sm,
          color: colors.secondaryText,
          lineHeight: 1.5,
          maxWidth: '400px',
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
