import React from 'react';
import { colors, typography, radii, shadows } from '../../tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'flat' | 'highlight';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'highlight':
        return {
          backgroundColor: colors.lightBotanical,
          border: `1px solid ${colors.secondaryGreen}`,
          boxShadow: shadows.card,
        };
      case 'flat':
        return {
          backgroundColor: colors.cardSurface,
          border: `1px solid ${colors.border}`,
          boxShadow: 'none',
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.cardSurface,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.card,
        };
    }
  };

  return (
    <div
      style={{
        borderRadius: radii.lg,
        fontFamily: typography.fontFamily,
        color: colors.primaryText,
        overflow: 'hidden',
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div
    style={{
      padding: '1.25rem 1.5rem',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  style,
  ...props
}) => (
  <h3
    style={{
      margin: 0,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.deepForestGreen,
      letterSpacing: '-0.01em',
      ...style,
    }}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  style,
  ...props
}) => (
  <p
    style={{
      margin: 0,
      fontSize: typography.fontSize.sm,
      color: colors.secondaryText,
      lineHeight: 1.5,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div
    style={{
      padding: '1.5rem',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div
    style={{
      padding: '1rem 1.5rem',
      backgroundColor: colors.adminBackground,
      borderTop: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);
