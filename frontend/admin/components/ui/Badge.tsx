import React from 'react';
import { colors, typography, radii } from '../../tokens';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: '#E7F4EE',
          color: colors.success,
          border: '1px solid #C4E3D5',
        };
      case 'warning':
        return {
          backgroundColor: '#FBF5E9',
          color: colors.warning,
          border: '1px solid #EEDBB9',
        };
      case 'danger':
        return {
          backgroundColor: '#FAECEB',
          color: colors.danger,
          border: '1px solid #ECC7C4',
        };
      case 'info':
        return {
          backgroundColor: colors.softSky,
          color: colors.primaryGreen,
          border: '1px solid #BFDCEF',
        };
      case 'neutral':
        return {
          backgroundColor: colors.adminBackground,
          color: colors.secondaryText,
          border: `1px solid ${colors.border}`,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.lightBotanical,
          color: colors.deepForestGreen,
          border: `1px solid ${colors.border}`,
        };
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: isSmall ? '0.15rem 0.4rem' : '0.25rem 0.6rem',
        borderRadius: radii.full,
        fontFamily: typography.fontFamily,
        fontSize: isSmall ? typography.fontSize.xs : typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        lineHeight: 1.2,
        userSelect: 'none',
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};
