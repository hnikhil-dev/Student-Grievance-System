import React from 'react';
import { StatCardProps } from '../../types/ui';
import { colors, typography, radii, shadows } from '../../tokens';

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = colors.primaryGreen,
}) => {
  return (
    <div
      style={{
        backgroundColor: colors.cardSurface,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.lg,
        padding: '1.25rem 1.5rem',
        boxShadow: shadows.card,
        fontFamily: typography.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top row: Title and Icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.secondaryText,
          }}
        >
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: radii.md,
              backgroundColor: colors.lightBotanical,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.deepForestGreen,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          marginBottom: '0.35rem',
        }}
      >
        {value}
      </div>

      {/* Subtitle / Trend */}
      {(subtitle || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: typography.fontSize.xs }}>
          {trend && (
            <span
              style={{
                color: trend.isPositive ? colors.success : colors.danger,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {subtitle && (
            <span style={{ color: colors.secondaryText }}>
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Subtle bottom indicator border */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          backgroundColor: accentColor,
          opacity: 0.8,
        }}
      />
    </div>
  );
};
