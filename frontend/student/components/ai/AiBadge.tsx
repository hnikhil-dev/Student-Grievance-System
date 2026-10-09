'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { BadgeSize } from '../../types/design-system';

export interface AiBadgeProps {
  label: string;
  confidence?: number; // 0.0 - 1.0
  size?: BadgeSize;
  variant?: 'indigo' | 'emerald' | 'subtle';
}

export const AiBadge: React.FC<AiBadgeProps> = ({
  label,
  confidence,
  size = 'md',
  variant = 'indigo',
}) => {
  const variantStyles = {
    indigo: {
      bg: '#EEF2FF',
      text: '#3730A3',
      border: '#C7D2FE',
      iconBg: '#4F46E5',
    },
    emerald: {
      bg: '#ECFDF5',
      text: '#065F46',
      border: '#A7F3D0',
      iconBg: '#059669',
    },
    subtle: {
      bg: '#F8FAFC',
      text: '#334155',
      border: '#E2E8F0',
      iconBg: '#64748B',
    },
  };

  const styleConfig = variantStyles[variant];

  const sizeStyles: Record<BadgeSize, { padding: string; font: string; iconSize: string }> = {
    sm: { padding: '0.2rem 0.5rem', font: '0.75rem', iconSize: '12px' },
    md: { padding: '0.35rem 0.75rem', font: '0.8125rem', iconSize: '14px' },
    lg: { padding: '0.5rem 1rem', font: '0.875rem', iconSize: '16px' },
  };

  const sStyle = sizeStyles[size];

  const confidencePercent = confidence !== undefined ? Math.round(confidence * 100) : null;

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
        backgroundColor: styleConfig.bg,
        color: styleConfig.text,
        border: `1px solid ${styleConfig.border}`,
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sparkles size={sStyle.iconSize === '12px' ? 11 : sStyle.iconSize === '14px' ? 13 : 15} color={styleConfig.text} />
      </span>
      <span>{label}</span>
      {confidencePercent !== null && (
        <span
          style={{
            marginLeft: '0.15rem',
            padding: '0.05rem 0.35rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            color: styleConfig.text,
            fontSize: '0.7rem',
            fontWeight: 700,
          }}
          title={`AI Confidence Score: ${confidencePercent}%`}
        >
          {confidencePercent}% AI match
        </span>
      )}
    </span>
  );
};
