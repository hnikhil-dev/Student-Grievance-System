'use client';

import React from 'react';
import { Button } from './Button';

export type ErrorStateVariant =
  | 'network'
  | 'auth'
  | 'api'
  | 'ai_unavailable'
  | 'validation'
  | 'permission'
  | 'not_found'
  | 'custom';

export interface ErrorStateProps {
  variant?: ErrorStateVariant;
  title?: string;
  message?: string;
  onRetry?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const ERROR_PRESETS: Record<Exclude<ErrorStateVariant, 'custom'>, { icon: string; title: string; message: string; retryLabel?: string }> = {
  network: {
    icon: '📡',
    title: 'Network Connection Issue',
    message: 'Unable to reach the campus grievance servers. Please check your network connection and try again.',
    retryLabel: 'Retry Connection',
  },
  auth: {
    icon: '🔒',
    title: 'Session Expired or Unauthorized',
    message: 'Your authenticated session could not be verified or has timed out. Please sign in to continue.',
    retryLabel: 'Sign In Again',
  },
  api: {
    icon: '⚠️',
    title: 'Server Error Occurred',
    message: 'The institution server encountered a temporary issue while processing your request. Our technical team has been notified.',
    retryLabel: 'Try Again',
  },
  ai_unavailable: {
    icon: '🤖',
    title: 'AI Analysis Temporarily Unavailable',
    message: 'Automated AI classification is currently experiencing high load. You can continue submitting your grievance manually without interruption.',
    retryLabel: 'Retry AI Analysis',
  },
  validation: {
    icon: '✏️',
    title: 'Input Validation Error',
    message: 'Some required fields are missing or improperly formatted. Please review the highlighted form fields and try again.',
    retryLabel: 'Review Fields',
  },
  permission: {
    icon: '🚫',
    title: 'Access Restricted',
    message: 'You do not have permission to view or modify this grievance record. Only the submitting student or authorized campus officers can access it.',
    retryLabel: 'Return to Dashboard',
  },
  not_found: {
    icon: '🔍',
    title: 'Grievance Record Not Found',
    message: 'The requested grievance ticket could not be found. It may have been archived or removed.',
    retryLabel: 'View All Grievances',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  variant = 'custom',
  title,
  message,
  onRetry,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const preset = variant !== 'custom' ? ERROR_PRESETS[variant] : null;

  const displayIcon = preset?.icon || '⚠️';
  const displayTitle = title || preset?.title || 'Unable to Load Data';
  const displayMessage = message || preset?.message || 'An unexpected error occurred while communicating with the institution server. Please try again.';
  const retryLabel = preset?.retryLabel || 'Retry';

  // Sanitize message: never display raw code/stack traces to user
  const sanitizedMessage = displayMessage.length > 250 || displayMessage.includes('at ') || displayMessage.includes('Error:')
    ? 'A system error occurred. Please refresh the page or try again later.'
    : displayMessage;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2.5rem 1.25rem',
        backgroundColor: '#FEF2F2',
        borderRadius: '20px',
        border: '1px solid #FCA5A5',
        margin: '1rem 0',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          marginBottom: '1rem',
        }}
      >
        {displayIcon}
      </div>

      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#991B1B' }}>
        {displayTitle}
      </h3>
      <p
        style={{
          margin: '0.4rem 0 1.5rem 0',
          fontSize: '0.875rem',
          color: '#B91C1C',
          maxWidth: '440px',
          lineHeight: 1.5,
          overflowWrap: 'break-word',
        }}
      >
        {sanitizedMessage}
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {onRetry && (
          <Button variant="danger" size="md" onClick={onRetry}>
            🔄 {retryLabel}
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
