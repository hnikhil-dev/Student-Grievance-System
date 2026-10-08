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

export const AdminKpiSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(230px, 1fr))`,
      gap: '1rem',
      width: '100%',
    }}
  >
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        style={{
          backgroundColor: '#FFFFFF',
          border: `1px solid #E5E7EB`,
          borderRadius: radii.lg,
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              width: '45%',
              height: '14px',
              backgroundColor: colors.lightBotanical,
              borderRadius: radii.sm,
              animation: 'adminPulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: radii.md,
              backgroundColor: colors.lightBotanical,
              animation: 'adminPulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
        <div
          style={{
            width: '60%',
            height: '28px',
            backgroundColor: colors.lightBotanical,
            borderRadius: radii.sm,
            animation: 'adminPulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '75%',
            height: '12px',
            backgroundColor: colors.lightBotanical,
            borderRadius: radii.sm,
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
    ))}
  </div>
);

export const AdminTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
    {Array.from({ length: rows }).map((_, idx) => (
      <div
        key={idx}
        style={{
          backgroundColor: '#FFFFFF',
          border: `1px solid #E5E7EB`,
          borderRadius: radii.md,
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <div
            style={{
              width: '40%',
              height: '16px',
              backgroundColor: colors.lightBotanical,
              borderRadius: radii.sm,
              animation: 'adminPulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '70%',
              height: '12px',
              backgroundColor: colors.lightBotanical,
              borderRadius: radii.sm,
              animation: 'adminPulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
        <div
          style={{
            width: '90px',
            height: '24px',
            backgroundColor: colors.lightBotanical,
            borderRadius: radii.full,
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
    ))}
  </div>
);
