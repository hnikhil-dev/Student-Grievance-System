'use client';

import React from 'react';
import { GrievanceStatusType, BadgeSize } from '../../types/design-system';

export interface StatusBadgeProps {
  status: GrievanceStatusType | string;
  size?: BadgeSize;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const normStatus = (status || 'SUBMITTED').toUpperCase() as GrievanceStatusType;

  // Visual mapping for all 10 canonical statuses
  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; dot: string; icon: string }> = {
    SUBMITTED: {
      label: 'Submitted',
      bg: '#F0F9FF',
      text: '#0369A1',
      border: '#BAE6FD',
      dot: '#0284C7',
      icon: '📥',
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      bg: '#FFFBEB',
      text: '#B45309',
      border: '#FDE68A',
      dot: '#D97706',
      icon: '🔍',
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: '#F5F3FF',
      text: '#6D28D9',
      border: '#DDD6FE',
      dot: '#7C3AED',
      icon: '👤',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: '#EFF6FF',
      text: '#1D4ED8',
      border: '#BFDBFE',
      dot: '#2563EB',
      icon: '⚙️',
    },
    RESOLUTION_PROPOSED: {
      label: 'Resolution Proposed',
      bg: '#F0FDFA',
      text: '#0F766E',
      border: '#99F6E4',
      dot: '#0D9488',
      icon: '💡',
    },
    STUDENT_VERIFICATION: {
      label: 'Awaiting Verification',
      bg: '#FEF3C7',
      text: '#92400E',
      border: '#FDE68A',
      dot: '#D97706',
      icon: '⏳',
    },
    AWAITING_VERIFICATION: {
      label: 'Awaiting Verification',
      bg: '#FEF3C7',
      text: '#92400E',
      border: '#FDE68A',
      dot: '#D97706',
      icon: '⏳',
    },
    RESOLVED: {
      label: 'Resolved',
      bg: '#ECFDF5',
      text: '#047857',
      border: '#A7F3D0',
      dot: '#059669',
      icon: '✅',
    },
    CLOSED: {
      label: 'Closed & Verified',
      bg: '#ECFDF5',
      text: '#047857',
      border: '#A7F3D0',
      dot: '#059669',
      icon: '✔',
    },
    REOPENED: {
      label: 'Reopened',
      bg: '#FFF1F2',
      text: '#BE123C',
      border: '#FECDD3',
      dot: '#E11D48',
      icon: '🔄',
    },
    REJECTED: {
      label: 'Rejected',
      bg: '#F8FAFC',
      text: '#475569',
      border: '#E2E8F0',
      dot: '#64748B',
      icon: '🚫',
    },
    ESCALATED: {
      label: 'Escalated',
      bg: '#FEF2F2',
      text: '#B91C1C',
      border: '#FCA5A5',
      dot: '#DC2626',
      icon: '🚨',
    },
  };

  const config = statusConfig[normStatus] || statusConfig.SUBMITTED;

  const sizeStyles: Record<BadgeSize, { padding: string; font: string; dotSize: string }> = {
    sm: { padding: '0.2rem 0.5rem', font: '0.75rem', dotSize: '6px' },
    md: { padding: '0.3rem 0.75rem', font: '0.8125rem', dotSize: '8px' },
    lg: { padding: '0.45rem 1rem', font: '0.875rem', dotSize: '10px' },
  };

  const sStyle = sizeStyles[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
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
      {showDot && (
        <span
          style={{
            width: sStyle.dotSize,
            height: sStyle.dotSize,
            borderRadius: '50%',
            backgroundColor: config.dot,
            display: 'inline-block',
          }}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
