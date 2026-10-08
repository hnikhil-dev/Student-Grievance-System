import React from 'react';
import { PriorityLevel } from '../../types/domain';
import { Badge } from './Badge';

export interface PriorityBadgeProps {
  level: PriorityLevel;
  score?: number;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ level, score }) => {
  const getBadgeVariant = (): 'danger' | 'warning' | 'info' | 'neutral' => {
    switch (level) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
      default:
        return 'neutral';
    }
  };

  return (
    <Badge variant={getBadgeVariant()} size="sm">
      <span style={{ fontWeight: 600 }}>{level}</span>
      {score !== undefined && (
        <span style={{ opacity: 0.85, fontSize: '0.7rem' }}>
          ({score})
        </span>
      )}
    </Badge>
  );
};
