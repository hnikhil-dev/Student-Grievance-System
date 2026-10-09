'use client';

import React from 'react';
import { Button } from './Button';
import { WifiOff, Lock, AlertTriangle, Bot, FileEdit, ShieldAlert, Search, RotateCcw } from 'lucide-react';

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

const ERROR_PRESETS: Record<Exclude<ErrorStateVariant, 'custom'>, { Icon: React.ElementType; title: string; message: string; retryLabel?: string }> = {
  network: {
    Icon: WifiOff,
    title: 'Network Connection Issue',
    message: 'Unable to reach the campus grievance servers. Please check your network connection and try again.',
    retryLabel: 'Retry Connection',
  },
  auth: {
    Icon: Lock,
    title: 'Session Expired or Unauthorized',
    message: 'Your authenticated session could not be verified or has timed out. Please sign in to continue.',
    retryLabel: 'Sign In Again',
  },
  api: {
    Icon: AlertTriangle,
    title: 'Server Error Occurred',
    message: 'The institution server encountered a temporary issue while processing your request. Our technical team has been notified.',
    retryLabel: 'Try Again',
  },
  ai_unavailable: {
    Icon: Bot,
    title: 'AI Analysis Temporarily Unavailable',
    message: 'Automated AI classification is currently experiencing high load. You can continue submitting your grievance manually without interruption.',
    retryLabel: 'Retry AI Analysis',
  },
  validation: {
    Icon: FileEdit,
    title: 'Input Validation Error',
    message: 'Some required fields are missing or improperly formatted. Please review the highlighted form fields and try again.',
    retryLabel: 'Review Fields',
  },
  permission: {
    Icon: ShieldAlert,
    title: 'Access Restricted',
    message: 'You do not have permission to view or modify this grievance record. Only the submitting student or authorized campus officers can access it.',
    retryLabel: 'Return to Dashboard',
  },
  not_found: {
    Icon: Search,
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
  const PresetIcon = preset?.Icon || AlertTriangle;

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
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #FEE2E2',
        boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.05)',
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
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: '#DC2626',
        }}
      >
        <PresetIcon size={28} strokeWidth={1.8} />
      </div>

      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#991B1B',
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
        {sanitizedMessage}
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {onRetry && (
          <Button variant="danger" size="md" onClick={onRetry} leftIcon={<RotateCcw size={16} />}>
            {retryLabel}
          </Button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" size="md" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
