'use client';

import React from 'react';
import { Button } from './Button';

export type EmptyStateVariant = 'grievances' | 'notifications' | 'comments' | 'feedback' | 'search' | 'custom';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const PRESETS: Record<Exclude<EmptyStateVariant, 'custom'>, { icon: string; title: string; description: string; actionLabel?: string }> = {
  grievances: {
    icon: '📋',
    title: 'No Grievances Reported Yet',
    description: 'You have not submitted any complaints or requests. If you face academic, hostel, or facility issues, submit a grievance to have it routed to the right campus department.',
    actionLabel: 'Report a Grievance',
  },
  notifications: {
    icon: '🔔',
    title: 'All Caught Up!',
    description: 'You have no new notifications right now. When an officer is assigned to your ticket, updates occur, or resolutions are posted, alerts will appear here.',
    actionLabel: 'Go to Dashboard',
  },
  comments: {
    icon: '💬',
    title: 'No Comments Yet',
    description: 'No messages have been posted on this grievance. You can send questions, clarifications, or updates directly to the assigned department below.',
  },
  feedback: {
    icon: '⭐',
    title: 'No Completed Grievances for Feedback',
    description: 'Feedback is available once a grievance is resolved and closed. When your tickets are closed, you will be able to submit your ratings and review campus handling here.',
    actionLabel: 'View Active Grievances',
  },
  search: {
    icon: '🔍',
    title: 'No Matching Results Found',
    description: 'None of your grievances match your current search terms or selected filters. Try broadening your keywords or clearing the active filters.',
    actionLabel: 'Clear All Filters',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'custom',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const preset = variant !== 'custom' ? PRESETS[variant] : null;

  const displayIcon = icon || preset?.icon || '📋';
  const displayTitle = title || preset?.title || 'No Records Found';
  const displayDesc = description || preset?.description || 'There is no data to display right now.';
  const displayAction = actionLabel || preset?.actionLabel;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2.5rem 1.25rem',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px dashed #D1D5DB',
        margin: '1rem 0',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#F4F9F6',
          border: '1px solid #D8F3DC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '1rem',
        }}
      >
        {displayIcon}
      </div>

      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>
        {displayTitle}
      </h3>
      <p
        style={{
          margin: '0.4rem 0 1.5rem 0',
          fontSize: '0.875rem',
          color: '#6B7280',
          maxWidth: '440px',
          lineHeight: 1.5,
          overflowWrap: 'break-word',
        }}
      >
        {displayDesc}
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {displayAction && onAction && (
          <Button variant="primary" size="md" onClick={onAction}>
            {displayAction}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="secondary" size="md" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
