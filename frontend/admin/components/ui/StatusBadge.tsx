import React from 'react';
import { StatusBadgeProps, StatusType } from '../../types/ui';
import { Badge } from './Badge';
import { colors } from '../../tokens';

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  dot = true,
}) => {
  const getDotColor = (s: StatusType): string => {
    switch (s) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.danger;
      case 'info':
        return colors.primaryGreen;
      case 'neutral':
      default:
        return colors.secondaryText;
    }
  };

  return (
    <Badge variant={status} size="sm">
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: getDotColor(status),
            display: 'inline-block',
          }}
        />
      )}
      <span>{label}</span>
    </Badge>
  );
};
