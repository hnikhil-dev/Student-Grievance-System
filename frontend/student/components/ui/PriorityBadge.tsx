'use client';

import React from 'react';
import { PriorityLevel, BadgeSize } from '../../types/design-system';
import { ArrowDown, Clock, AlertTriangle, AlertOctagon } from 'lucide-react';

export interface PriorityBadgeProps {
  priority: PriorityLevel | string;
  score?: number;
  size?: BadgeSize;
  showScore?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  score,
  size = 'md',
  showScore = false,
}) => {
  const normPriority = (priority || 'MEDIUM').toUpperCase() as PriorityLevel;

  const priorityConfig: Record<PriorityLevel, { label: string; bg: string; text: string; border: string; Icon: React.ElementType }> = {
    LOW: { label: 'Low', bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', Icon: ArrowDown },
    MEDIUM: { label: 'Medium', bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', Icon: Clock },
    HIGH: { label: 'High', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', Icon: AlertTriangle },
    CRITICAL: { label: 'Critical', bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5', Icon: AlertOctagon },
  };

  const config = priorityConfig[normPriority] || priorityConfig.MEDIUM;
  const IconComponent = config.Icon;

  const sizeStyles: Record<BadgeSize, { padding: string; font: string; iconSize: number }> = {
    sm: { padding: '0.2rem 0.5rem', font: '0.75rem', iconSize: 11 },
    md: { padding: '0.3rem 0.75rem', font: '0.8125rem', iconSize: 13 },
    lg: { padding: '0.45rem 1rem', font: '0.875rem', iconSize: 15 },
  };

  const sStyle = sizeStyles[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: sStyle.padding,
        fontSize: sStyle.font,
        fontWeight: 700,
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <IconComponent size={sStyle.iconSize} strokeWidth={2.2} />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span
          style={{
            marginLeft: '0.15rem',
            padding: '0.05rem 0.35rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(0,0,0,0.06)',
            fontSize: '0.7rem',
            fontWeight: 800,
          }}
          title={`Priority Score: ${score}/100`}
        >
          {score}
        </span>
      )}
    </span>
  );
};
