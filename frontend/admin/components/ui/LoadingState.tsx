import React from 'react';
import { colors, typography, radii } from '../../tokens';

export interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'inline';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading administrative data...',
  variant = 'spinner',
}) => {
  if (variant === 'inline') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: colors.secondaryText,
          fontSize: typography.fontSize.sm,
          fontFamily: typography.fontFamily,
        }}
      >
        <span
          style={{
            width: '14px',
            height: '14px',
            border: `2px solid ${colors.primaryGreen}`,
            borderRightColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'adminSpin 0.8s linear infinite',
          }}
        />
        <span>{message}</span>
        <style>{`
          @keyframes adminSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%',
        }}
      >
        <div
          style={{
            height: '80px',
            backgroundColor: colors.lightBotanical,
            borderRadius: radii.lg,
            opacity: 0.6,
            animation: 'adminPulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: '140px',
            backgroundColor: colors.lightBotanical,
            borderRadius: radii.lg,
            opacity: 0.5,
            animation: 'adminPulse 1.5s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes adminPulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        fontFamily: typography.fontFamily,
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: `3px solid ${colors.lightBotanical}`,
          borderTopColor: colors.primaryGreen,
          borderRadius: '50%',
          animation: 'adminSpin 0.8s linear infinite',
          marginBottom: '1rem',
        }}
      />
      <div
        style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: colors.primaryText,
          marginBottom: '0.25rem',
        }}
      >
        {message}
      </div>
      <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
        Communicating with Institutional Gateway...
      </div>
      <style>{`
        @keyframes adminSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
