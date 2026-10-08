'use client';

import React, { useState, useEffect } from 'react';
import { SlaHealthStatus, BadgeSize } from '../../types/design-system';

export interface SlaIndicatorProps {
  slaStatus?: {
    remainingMinutes: number;
    elapsedPercent?: number;
    isOverdue: boolean;
    isWarning: boolean;
    dueAt?: string;
    slaHours?: number;
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
  if (isOverdue || elapsedPercent >= 100) health = 'BREACHED';
  else if (isWarning || elapsedPercent > 75) health = 'WARNING';

  const slaConfig: Record<SlaHealthStatus, { label: string; bg: string; text: string; border: string; icon: string }> = {
    ON_TRACK: {
      label: remainingMinutes > 60 ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m remaining` : `${Math.max(0, remainingMinutes)}m remaining`,
      bg: '#ECFDF5',
      text: '#047857',
      border: '#A7F3D0',
      icon: '⏱',
    },
    WARNING: {
      label: remainingMinutes > 0 ? `⚠️ SLA Warning: ${remainingMinutes > 60 ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m` : `${remainingMinutes}m`} remaining (${Math.round(elapsedPercent)}%)` : '⚠️ SLA Threshold Nearing',
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
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.35rem', width: showProgress ? '100%' : 'auto' }}>
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
          width: 'fit-content',
        }}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>

      {showProgress && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '100%' }}>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, elapsedPercent))}%`,
                backgroundColor: isOverdue || elapsedPercent >= 100 ? '#DC2626' : (isWarning || elapsedPercent > 75) ? '#D97706' : '#059669',
                transition: 'width 300ms ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6B7280' }}>
            <span>{Math.round(elapsedPercent)}% consumed</span>
            <span>{isOverdue ? 'Overdue' : `${Math.max(0, remainingMinutes)}m left`}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export interface DynamicSlaBarProps {
  slaStatus?: {
    remainingMinutes: number;
    elapsedPercent?: number;
    isOverdue: boolean;
    isWarning: boolean;
    dueAt?: string;
    slaHours?: number;
  };
  compact?: boolean;
}

/**
 * Dynamic SLA Countdown Bar
 * Live visual progress bar showing:
 * - Remaining time (sla_status.remainingMinutes)
 * - Percentage consumed (sla_status.elapsedPercent)
 * - Warning state (yellow if >75%) and Breach state (red if overdue)
 */
export const DynamicSlaBar: React.FC<DynamicSlaBarProps> = ({
  slaStatus,
  compact = false,
}) => {
  const [ticker, setTicker] = useState(0);

  // Live minute ticker to refresh remaining visual countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!slaStatus) {
    return (
      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
        ⏱ Standard SLA Target (24 hours)
      </div>
    );
  }

  const { remainingMinutes, elapsedPercent = 0, isOverdue, isWarning, dueAt, slaHours } = slaStatus;

  // Warning state if > 75% or isWarning; Breach state if overdue or elapsedPercent >= 100
  const isBreached = isOverdue || elapsedPercent >= 100;
  const isWarn = !isBreached && (isWarning || elapsedPercent > 75);

  const theme = isBreached
    ? {
        bg: '#FEF2F2',
        border: '#FCA5A5',
        text: '#B91C1C',
        barColor: '#EF4444',
        statusLabel: 'BREACHED',
        icon: '🚨',
      }
    : isWarn
    ? {
        bg: '#FFFBEB',
        border: '#FDE68A',
        text: '#B45309',
        barColor: '#F59E0B',
        statusLabel: 'WARNING (>75% Consumed)',
        icon: '⚠️',
      }
    : {
        bg: '#ECFDF5',
        border: '#A7F3D0',
        text: '#047857',
        barColor: '#10B981',
        statusLabel: 'ON TRACK',
        icon: '⏱',
      };

  const formattedRemaining =
    isBreached
      ? 'Deadline passed'
      : remainingMinutes > 60
      ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m remaining`
      : `${Math.max(0, remainingMinutes)}m remaining`;

  const formattedDueAt = dueAt
    ? new Date(dueAt).toLocaleTimeString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div
      style={{
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: compact ? '0.6rem 0.85rem' : '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.4rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.95rem' }}>{theme.icon}</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.text, letterSpacing: '0.02em' }}>
            SLA: {theme.statusLabel}
          </span>
          <span style={{ fontSize: '0.75rem', color: theme.text, fontWeight: 600 }}>
            • {formattedRemaining}
          </span>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: theme.text,
            backgroundColor: '#FFFFFF',
            padding: '0.15rem 0.45rem',
            borderRadius: '6px',
            border: `1px solid ${theme.border}`,
          }}
        >
          {Math.min(100, Math.round(elapsedPercent))}% consumed
        </span>
      </div>

      {/* Visual Progress Bar Track */}
      <div
        style={{
          width: '100%',
          height: compact ? '6px' : '8px',
          backgroundColor: '#E5E7EB',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, elapsedPercent))}%`,
            backgroundColor: theme.barColor,
            borderRadius: '9999px',
            transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      {/* Subtext info */}
      {!compact && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#6B7280',
          }}
        >
          <span>Target: {slaHours || 24}h SLA standard</span>
          {formattedDueAt && <span>Due by: {formattedDueAt}</span>}
        </div>
      )}
    </div>
  );
};
