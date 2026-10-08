'use client';

import React from 'react';

export type ActionActor = 'STUDENT' | 'DEPARTMENT' | 'SYSTEM' | 'COMPLETED';

export interface NextActionCardProps {
  status: string;
  isSlaWarning?: boolean;
  isSlaBreached?: boolean;
  assigneeName?: string | null;
  departmentName?: string | null;
  onStudentAction?: () => void;
  actionButtonText?: string;
  style?: React.CSSProperties;
}

export const NextActionCard: React.FC<NextActionCardProps> = ({
  status,
  isSlaWarning = false,
  isSlaBreached = false,
  assigneeName,
  departmentName = 'Department',
  onStudentAction,
  actionButtonText,
  style,
}) => {
  // Determine who owns the next action
  let actor: ActionActor = 'DEPARTMENT';
  let badgeLabel = 'Department Action';
  let title = 'Processing Grievance';
  let description = `${departmentName} is actively reviewing this ticket.`;
  let icon = '⚙️';
  let themeColor = '#1D4ED8'; // Blue
  let bgGradient = 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)';
  let borderColor = '#BFDBFE';

  const normalizedStatus = status?.toUpperCase() || 'SUBMITTED';

  if (normalizedStatus === 'RESOLUTION_PROPOSED') {
    actor = 'STUDENT';
    badgeLabel = 'Your Action';
    title = 'Review Proposed Resolution';
    description =
      'The department has submitted a resolution. Please inspect their resolution notes and confirm if the issue is solved or request a reopen.';
    icon = '📋';
    themeColor = '#D97706'; // Amber
    bgGradient = 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)';
    borderColor = '#FDE68A';
  } else if (normalizedStatus === 'STUDENT_VERIFICATION') {
    actor = 'STUDENT';
    badgeLabel = 'Your Action';
    title = 'Verify Resolution & Provide Feedback';
    description =
      'Confirmation from you is needed to mark this grievance officially closed and record your experience feedback.';
    icon = '⭐';
    themeColor = '#D97706';
    bgGradient = 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)';
    borderColor = '#FDE68A';
  } else if (normalizedStatus === 'SUBMITTED') {
    actor = 'DEPARTMENT';
    badgeLabel = 'Department Action';
    title = 'Awaiting Officer Triage';
    description = `${departmentName} administration is evaluating parameters to assign the designated handling officer.`;
    icon = '⏳';
    themeColor = '#4F46E5';
    bgGradient = 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)';
    borderColor = '#C7D2FE';
  } else if (normalizedStatus === 'UNDER_REVIEW') {
    actor = 'DEPARTMENT';
    badgeLabel = 'Department Action';
    title = 'Preliminary Investigation';
    description = `${assigneeName ? `${assigneeName} is` : 'Assigned officer is'} examining ticket evidence, location context, and urgency triggers.`;
    icon = '🔍';
    themeColor = '#2563EB';
    bgGradient = 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)';
    borderColor = '#BFDBFE';
  } else if (normalizedStatus === 'ASSIGNED') {
    actor = 'DEPARTMENT';
    badgeLabel = 'Department Action';
    title = `Assigned to ${assigneeName || 'Officer'}`;
    description = `Ticket has been queued for immediate investigation by ${assigneeName || 'the assigned officer'}.`;
    icon = '👤';
    themeColor = '#2563EB';
    bgGradient = 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)';
    borderColor = '#BFDBFE';
  } else if (normalizedStatus === 'IN_PROGRESS') {
    actor = 'DEPARTMENT';
    badgeLabel = 'Department Action';
    title = 'Active Resolution in Progress';
    description = `${departmentName} is actively working on corrective action. Progress milestones will appear on your timeline.`;
    icon = '🔧';
    themeColor = '#2563EB';
    bgGradient = 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)';
    borderColor = '#BFDBFE';
  } else if (normalizedStatus === 'REOPENED') {
    actor = 'DEPARTMENT';
    badgeLabel = 'Department Action';
    title = 'Reopened Ticket Re-investigation';
    description =
      'You requested further resolution. The department has been notified to re-evaluate the corrective action.';
    icon = '🔄';
    themeColor = '#EA580C';
    bgGradient = 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)';
    borderColor = '#FED7AA';
  } else if (normalizedStatus === 'CLOSED') {
    actor = 'COMPLETED';
    badgeLabel = 'Lifecycle Complete';
    title = 'Grievance Resolved & Verified';
    description = 'The issue has been addressed and confirmed. All audit logs and history are archived.';
    icon = '✅';
    themeColor = '#059669';
    bgGradient = 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)';
    borderColor = '#A7F3D0';
  } else if (normalizedStatus === 'REJECTED') {
    actor = 'COMPLETED';
    badgeLabel = 'Case Concluded';
    title = 'Grievance Not Accepted';
    description = 'The department has provided a rationale why this request cannot proceed under standard procedures.';
    icon = 'ℹ️';
    themeColor = '#64748B';
    bgGradient = 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)';
    borderColor = '#E2E8F0';
  }

  return (
    <div
      className="sg-animate-slide-up sg-action-card"
      style={{
        borderRadius: '16px',
        background: bgGradient,
        border: `1px solid ${borderColor}`,
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              backgroundColor: themeColor,
              color: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {badgeLabel}
          </span>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
            {icon} {title}
          </h4>
        </div>

        {/* SLA System Awareness Tag if Approaching/Breached */}
        {isSlaBreached && (
          <span
            className="sg-animate-pulse-soft"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid #FCA5A5',
            }}
          >
            ⚠️ System: SLA Breached — Escalated
          </span>
        )}
        {!isSlaBreached && isSlaWarning && (
          <span
            className="sg-animate-pulse-soft"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid #FCD34D',
            }}
          >
            ⏱️ System: SLA Approaching Deadline
          </span>
        )}
      </div>

      <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.55 }}>
        {description}
      </p>

      {actor === 'STUDENT' && onStudentAction && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <button
            type="button"
            onClick={onStudentAction}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '9999px',
              backgroundColor: '#2D6A4F',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(45, 106, 79, 0.25)',
              transition: 'background-color 150ms ease, transform 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1B4332';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2D6A4F';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {actionButtonText || 'Review Resolution Now →'}
          </button>
        </div>
      )}
    </div>
  );
};
