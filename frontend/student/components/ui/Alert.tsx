'use client';

import React from 'react';
import { AlertType } from '../../types/design-system';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
  style,
}) => {
  const alertStyles: Record<AlertType, { bg: string; text: string; border: string; icon: string }> = {
    info: { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD', icon: 'ℹ️' },
    success: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', icon: '✅' },
    warning: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', icon: '⚠️' },
    error: { bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5', icon: '🚨' },
    ai: { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE', icon: '🤖' },
  };

  const config = alertStyles[type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        fontSize: '0.875rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        ...style,
      }}
      className={className}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{config.icon}</span>
        <div>
          {title && <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, fontSize: '0.9375rem' }}>{title}</h4>}
          <div style={{ lineHeight: 1.5 }}>{children}</div>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: config.text,
            cursor: 'pointer',
            fontSize: '1rem',
            lineHeight: 1,
            padding: '0.2rem',
            opacity: 0.8,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
