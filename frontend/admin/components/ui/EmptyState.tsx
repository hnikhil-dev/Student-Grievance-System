import React from 'react';
import { Inbox } from 'lucide-react';
import { colors, typography, radii } from '../../tokens';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox size={26} color={colors.primaryGreen} />,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: colors.cardSurface,
        border: `1px dashed ${colors.border}`,
        borderRadius: radii.lg,
        fontFamily: typography.fontFamily,
        maxWidth: '520px',
        margin: '1.5rem auto',
        ...style,
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: radii.full,
          backgroundColor: colors.lightBotanical,
          color: colors.primaryGreen,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          marginBottom: '1rem',
        }}
      >
        {icon}
      </div>

      <h4
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.semibold,
          color: colors.deepForestGreen,
        }}
      >
        {title}
      </h4>

      <p
        style={{
          margin: '0 0 1.25rem 0',
          fontSize: typography.fontSize.sm,
          color: colors.secondaryText,
          lineHeight: 1.5,
          maxWidth: '380px',
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
