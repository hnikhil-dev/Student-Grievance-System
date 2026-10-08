'use client';

import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  variant?: 'emerald' | 'amber' | 'indigo' | 'rose';
  height?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = true,
  variant = 'emerald',
  height = '8px',
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const variantColors: Record<string, string> = {
    emerald: '#2D6A4F',
    amber: '#D97706',
    indigo: '#4F46E5',
    rose: '#DC2626',
  };

  const barColor = variantColors[variant] || variantColors.emerald;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {(label || showPercent) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
          {label && <span>{label}</span>}
          {showPercent && <span>{percent}%</span>}
        </div>
      )}

      <div style={{ width: '100%', height, backgroundColor: '#E5E7EB', borderRadius: '9999px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            backgroundColor: barColor,
            borderRadius: '9999px',
            transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
};
