'use client';

import React from 'react';
import { Button } from './Button';
import { ClipboardList, Bell, MessageSquare, Star, Search, Inbox } from 'lucide-react';

export type EmptyStateVariant = 'grievances' | 'notifications' | 'comments' | 'feedback' | 'search' | 'custom';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const PRESETS: Record<Exclude<EmptyStateVariant, 'custom'>, { Icon: React.ElementType; title: string; description: string; actionLabel?: string }> = {
  grievances: {
    Icon: ClipboardList,
    title: 'No Grievances Reported Yet',
    description: 'You have not submitted any complaints or requests. If you face academic, hostel, or facility issues, submit a grievance to have it routed to the right campus department.',
    actionLabel: 'Report a Grievance',
  },
  notifications: {
    Icon: Bell,
    title: 'All Caught Up!',
    description: 'You have no new notifications right now. When an officer is assigned to your ticket, updates occur, or resolutions are posted, alerts will appear here.',
    actionLabel: 'Go to Dashboard',
  },
  comments: {
    Icon: MessageSquare,
    title: 'No Comments Yet',
    description: 'No messages have been posted on this grievance. You can send questions, clarifications, or updates directly to the assigned department below.',
  },
  feedback: {
    Icon: Star,
    title: 'No Completed Grievances for Feedback',
    description: 'Feedback is available once a grievance is resolved and closed. When your tickets are closed, you will be able to submit your ratings and review campus handling here.',
    actionLabel: 'View Active Grievances',
  },
  search: {
    Icon: Search,
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
  const PresetIcon = preset?.Icon || Inbox;

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
          marginBottom: '1rem',
          color: '#1B4332',
        }}
      >
        {icon ? icon : <PresetIcon size={28} color="#2D6A4F" strokeWidth={1.8} />}
      </div>

      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#1B4332',
          letterSpacing: '-0.01em',
        }}
      >
        {displayTitle}
      </h3>

      <p
        style={{
          margin: '0 0 1.5rem 0',
          fontSize: '0.875rem',
          color: '#6B7280',
          maxWidth: '480px',
          lineHeight: 1.6,
        }}
      >
        {displayDesc}
      </p>

      {(displayAction || secondaryActionLabel) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {displayAction && onAction && (
            <Button variant="primary" size="md" onClick={onAction}>
              {displayAction}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
