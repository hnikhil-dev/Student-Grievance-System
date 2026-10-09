'use client';

import React, { useState, useEffect } from 'react';
import { SlaHealthStatus, BadgeSize } from '../../types/design-system';
import { Clock, AlertTriangle, AlertOctagon } from 'lucide-react';

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
      <span style={{ fontSize: '0.8125rem', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <Clock size={13} /> SLA 24h
      </span>
    );
  }

  const { remainingMinutes, elapsedPercent = 0, isOverdue, isWarning } = slaStatus;

  let health: SlaHealthStatus = 'ON_TRACK';
  if (isOverdue || elapsedPercent >= 100) health = 'BREACHED';
  else if (isWarning || elapsedPercent > 75) health = 'WARNING';

  const slaConfig: Record<SlaHealthStatus, { label: string; bg: string; text: string; border: string; Icon: React.ElementType }> = {
    ON_TRACK: {
      label: remainingMinutes > 60 ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m remaining` : `${Math.max(0, remainingMinutes)}m remaining`,
      bg: '#ECFDF5',
      text: '#047857',
      border: '#A7F3D0',
      Icon: Clock,
    },
    WARNING: {
      label: remainingMinutes > 0 ? `SLA Warning: ${remainingMinutes > 60 ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m` : `${remainingMinutes}m`} remaining (${Math.round(elapsedPercent)}%)` : 'SLA Threshold Nearing',
      bg: '#FFFBEB',
      text: '#B45309',
      border: '#FDE68A',
      Icon: AlertTriangle,
    },
    BREACHED: {
      label: 'Overdue (SLA Breached)',
      bg: '#FEF2F2',
      text: '#B91C1C',
      border: '#FCA5A5',
      Icon: AlertOctagon,
    },
    OVERDUE: {
      label: 'Overdue (SLA Breached)',
      bg: '#FEF2F2',
      text: '#B91C1C',
      border: '#FCA5A5',
      Icon: AlertOctagon,
    },
  };

  const config = slaConfig[health];
  const IconComponent = config.Icon;

  const sizeStyles: Record<BadgeSize, { padding: string; font: string; iconSize: number }> = {
    sm: { padding: '0.2rem 0.5rem', font: '0.75rem', iconSize: 11 },
    md: { padding: '0.35rem 0.75rem', font: '0.8125rem', iconSize: 13 },
    lg: { padding: '0.5rem 1rem', font: '0.875rem', iconSize: 15 },
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
        <IconComponent size={sStyle.iconSize} strokeWidth={2.2} />
        <span>{config.label}</span>
      </span>

      {showProgress && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '100%' }}>
          <div
            style={{
              height: '6px',
              width: '100%',
              backgroundColor: '#E5E7EB',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, elapsedPercent))}%`,
                backgroundColor: health === 'BREACHED' ? '#EF4444' : health === 'WARNING' ? '#F59E0B' : '#10B981',
                borderRadius: '9999px',
                transition: 'width 0.5s ease-out',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#6B7280' }}>
            <span>Target: {slaStatus.slaHours || 24}h</span>
            <span>{Math.round(elapsedPercent)}% used</span>
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

export const DynamicSlaBar: React.FC<DynamicSlaBarProps> = ({
  slaStatus,
  compact = false,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!slaStatus) {
    return (
      <div style={{ fontSize: '0.8rem', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <Clock size={13} /> Standard SLA Target (24 hours)
      </div>
    );
  }

  const { remainingMinutes, elapsedPercent = 0, isOverdue, isWarning, dueAt, slaHours } = slaStatus;

  const isBreached = isOverdue || elapsedPercent >= 100;
  const isWarn = !isBreached && (isWarning || elapsedPercent > 75);

  const theme = isBreached
    ? {
        bg: '#FEF2F2',
        border: '#FCA5A5',
        text: '#B91C1C',
        barColor: '#EF4444',
        statusLabel: 'BREACHED',
        Icon: AlertOctagon,
      }
    : isWarn
    ? {
        bg: '#FFFBEB',
        border: '#FDE68A',
        text: '#B45309',
        barColor: '#F59E0B',
        statusLabel: 'WARNING (>75% Consumed)',
        Icon: AlertTriangle,
      }
    : {
        bg: '#ECFDF5',
        border: '#A7F3D0',
        text: '#047857',
        barColor: '#10B981',
        statusLabel: 'ON TRACK',
        Icon: Clock,
      };

  const formattedRemaining =
    isBreached
      ? 'Deadline passed'
      : remainingMinutes > 60
      ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m remaining`
      : `${Math.max(0, remainingMinutes)}m remaining`;

  const ProgressIcon = theme.Icon;

  return (
    <div
      style={{
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: compact ? '0.65rem 0.85rem' : '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ProgressIcon size={14} color={theme.text} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {theme.statusLabel}
          </span>
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: theme.text }}>
          {formattedRemaining}
        </span>
      </div>

      <div
        style={{
          height: '7px',
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.06)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, elapsedPercent))}%`,
            backgroundColor: theme.barColor,
            borderRadius: '9999px',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: theme.text, opacity: 0.85 }}>
        <span>Institutional SLA Target: <strong>{slaHours || 24} hours</strong></span>
        {dueAt && <span>Due: {new Date(dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>}
      </div>
    </div>
  );
};
