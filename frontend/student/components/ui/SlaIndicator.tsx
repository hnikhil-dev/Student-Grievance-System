'use client';

import React from 'react';
import { SlaHealthStatus, BadgeSize } from '../../types/design-system';

export interface SlaIndicatorProps {
  slaStatus?: {
    remainingMinutes: number;
    elapsedPercent?: number;
    isOverdue: boolean;
    isWarning: boolean;
    dueAt?: string;
  };
  size?: BadgeSize;
  showProgress?: boolean;
}

export const SlaIndicator: React.FC<SlaIndicatorProps> = ({
  slaStatus,
  size = 'md',
  showProgress = false,
}) => {
  if (!slaStatus) {
    return (
      <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>⏱ SLA 24h</span>
    );
  }

  const { remainingMinutes, elapsedPercent = 0, isOverdue, isWarning } = slaStatus;

  let health: SlaHealthStatus = 'ON_TRACK';
  if (isOverdue) health = 'BREACHED';
  else if (isWarning) health = 'WARNING';

  const slaConfig: Record<SlaHealthStatus, { label: string; bg: string; text: string; border: string; icon: string }> = {
    ON_TRACK: {
      label: remainingMinutes > 60 ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m remaining` : `${remainingMinutes}m remaining`,
      bg: '#ECFDF5',
      text: '#047857',
      border: '#A7F3D0',
      icon: '⏱',
    },
    WARNING: {
      label: remainingMinutes > 0 ? `⚠️ SLA Warning: ${remainingMinutes}m remaining` : '⚠️ SLA Threshold Nearing',
      bg: '#FFFBEB',
      text: '#B45309',
      border: '#FDE68A',
      icon: '⚠️',
    },
    BREACHED: {
      label: '🚨 Overdue (SLA Breached)',
      bg: '#FEF2F2',
      text: '#B91C1C',
      border: '#FCA5A5',
      icon: '🚨',
    },
    OVERDUE: {
      label: '🚨 Overdue (SLA Breached)',
      bg: '#FEF2F2',
      text: '#B91C1C',
      border: '#FCA5A5',
      icon: '🚨',
    },
  };

  const config = slaConfig[health];

  const sizeStyles: Record<BadgeSize, { padding: string; font: string }> = {
    sm: { padding: '0.2rem 0.5rem', font: '0.75rem' },
    md: { padding: '0.35rem 0.75rem', font: '0.8125rem' },
    lg: { padding: '0.5rem 1rem', font: '0.875rem' },
  };

  const sStyle = sizeStyles[size];

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: sStyle.padding,
          fontSize: sStyle.font,
          fontWeight: 600,
          borderRadius: '9999px',
          backgroundColor: config.bg,
          color: config.text,
          border: `1px solid ${config.border}`,
          whiteSpace: 'nowrap',
        }}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>

      {showProgress && (
        <div style={{ width: '100%', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, elapsedPercent))}%`,
              backgroundColor: isOverdue ? '#DC2626' : isWarning ? '#D97706' : '#059669',
              transition: 'width 300ms ease',
            }}
          />
        </div>
      )}
    </div>
  );
};
