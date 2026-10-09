'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  StudentShell,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatusBadge,
  PriorityBadge,
  SlaIndicator,
  DynamicSlaBar,
  Timeline,
  Modal,
  Textarea,
  Alert,
  PageSpinner,
  GrievanceDetailSkeleton,
  ErrorState,
  EmptyState,
  ProgressBar,
  NextActionCard,
  AiReasoningCard,
} from '../index';
import { useRealtimeGrievances } from '@lib/useRealtime';
import { getDynamicAuthHeaders } from '@lib/api';
import { GrievanceStatusType, PriorityLevel, TimelineItem } from '../../types/design-system';
import {
  Printer,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  Lock,
  User,
  Landmark,
  Calendar,
  RefreshCw,
  AlertTriangle,
  AlertOctagon,
  Check,
  CheckCircle2,
  X,
  Image as ImageIcon,
  FileText,
  Paperclip,
  Send,
  GraduationCap,
  Star,
  Lightbulb,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface CommentAuthor {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

interface CommentItem {
  id: string;
  grievance_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  author?: CommentAuthor | null;
}

interface AttachmentItem {
  id: string;
  grievance_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface StatusHistoryItem {
  id: string;
  grievance_id: string;
  old_status: GrievanceStatusType | string | null;
  new_status: GrievanceStatusType | string;
  changed_by: string;
  reason?: string | null;
  metadata?: any;
  created_at: string;
}

interface GrievanceFullDetails {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  status: GrievanceStatusType | string;
  priority: PriorityLevel;
  priority_score: number;
  priority_reasons?: string[];
  location?: string | null;
  affected_students?: number;
  severity?: string;
  urgency?: string;
  recurrence?: boolean;
  is_confidential?: boolean;
  is_anonymous?: boolean;
  sla_hours?: number;
  due_at: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string | null;
  resolution_notes?: string | null;
  reopen_count?: number;
  ai_summary?: string | null;
  ai_confidence?: number | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
  assignee?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  comments: CommentItem[];
  attachments: AttachmentItem[];
  history: StatusHistoryItem[];
  sla_status?: {
    slaHours: number;
    dueAt: string;
    isOverdue: boolean;
    isWarning: boolean;
    remainingMinutes: number;
    elapsedPercent: number;
  };
}

export interface GrievanceDetailProps {
  id?: string;
}

export const GrievanceDetail: React.FC<GrievanceDetailProps> = ({ id: propId }) => {
  // Extract id from prop or window location
  const [grievanceId, setGrievanceId] = useState<string>(propId || '');

  // Main state
  const [grievance, setGrievance] = useState<GrievanceFullDetails | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // New comment state
  const [newCommentMessage, setNewCommentMessage] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Resolution verification / Reopen modal state
  const [isReopenModalOpen, setIsReopenModalOpen] = useState<boolean>(false);
  const [reopenReason, setReopenReason] = useState<string>('');
  const [isSubmittingVerify, setIsSubmittingVerify] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Resolve ID from path if not provided
  useEffect(() => {
    if (!propId && typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart !== 'grievances') {
        setGrievanceId(lastPart);
      }
    }
  }, [propId]);

  // Load Grievance Details
  const loadGrievance = useCallback(async () => {
    if (!grievanceId) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/grievances/${grievanceId}`, {
        headers: getDynamicAuthHeaders(),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGrievance(json.data);

        // Fetch populated comments with author profile objects
        try {
          const comRes = await fetch(`/api/grievances/${grievanceId}/comments`, {
            headers: getDynamicAuthHeaders(),
          });
          const comJson = await comRes.json();
          if (comJson.success && Array.isArray(comJson.data)) {
            setComments(comJson.data);
          } else {
            setComments(json.data.comments || []);
          }
        } catch {
          setComments(json.data.comments || []);
        }
      } else {
        setErrorMessage(json.error?.message || `Grievance '${grievanceId}' could not be located.`);
      }
    } catch {
      setErrorMessage('Network connection error while retrieving complaint details.');
    } finally {
      setIsLoading(false);
    }
  }, [grievanceId]);

  useEffect(() => {
    if (grievanceId) {
      loadGrievance();
    }
  }, [grievanceId, loadGrievance]);

  // Real-time WebSocket: live update grievance when status changes or resolution is posted
  useRealtimeGrievances((payload) => {
    if (payload?.new?.id === grievanceId || payload?.old?.id === grievanceId) {
      loadGrievance();
    }
  });

  // Post a New Comment
  const handlePostComment = async () => {
    const trimmed = newCommentMessage.trim();
    if (!trimmed || !grievanceId) return;

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const res = await fetch(`/api/grievances/${grievanceId}/comments`, {
        method: 'POST',
        headers: getDynamicAuthHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ message: trimmed }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setComments((prev) => [...prev, json.data]);
        setNewCommentMessage('');
        setActionSuccessMessage('Your comment has been posted to the department officer.');
      } else {
        setCommentError(json.error?.message || 'Failed to post comment.');
      }
    } catch {
      setCommentError('Network error while posting comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Verify Resolution (Accept or Reopen)
  const handleVerifyResolution = async (accepted: boolean) => {
    if (!grievanceId) return;

    if (!accepted && reopenReason.trim().length < 5) {
      setVerifyError('Please enter at least 5 characters detailing why the resolution was rejected.');
      return;
    }

    setIsSubmittingVerify(true);
    setVerifyError(null);

    try {
      const res = await fetch(`/api/grievances/${grievanceId}/verify`, {
        method: 'POST',
        headers: getDynamicAuthHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          accepted,
          reason: accepted ? undefined : reopenReason.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionSuccessMessage(
          accepted
            ? 'Resolution accepted! Grievance has been officially closed.'
            : 'Grievance reopened and returned to the responsible department officer.'
        );
        setIsReopenModalOpen(false);
        setReopenReason('');
        await loadGrievance();
      } else {
        setVerifyError(json.error?.message || 'Verification update failed.');
      }
    } catch {
      setVerifyError('Network error during verification update.');
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  // Build Vertical Timeline items from backend status history
  const timelineItems: TimelineItem[] = (grievance?.history || []).map((h, idx, arr) => {
    const isCurrent = idx === arr.length - 1;
    const isCompleted = idx < arr.length - 1;

    let title = `Status changed to ${h.new_status}`;
    if (h.new_status === 'SUBMITTED') title = 'Complaint Submitted & Registered';
    else if (h.new_status === 'UNDER_REVIEW') title = 'Under Institutional Review';
    else if (h.new_status === 'ASSIGNED') title = 'Assigned to Department Officer';
    else if (h.new_status === 'IN_PROGRESS') title = 'Work in Progress';
    else if (h.new_status === 'RESOLUTION_PROPOSED') title = 'Resolution Proposed by Officer';
    else if (h.new_status === 'STUDENT_VERIFICATION') title = 'Awaiting Student Verification';
    else if (h.new_status === 'RESOLVED') title = 'Resolved by Department';
    else if (h.new_status === 'CLOSED') title = 'Resolution Confirmed & Ticket Closed';
    else if (h.new_status === 'REOPENED') title = 'Reopened by Student';

    return {
      id: h.id,
      title,
      status: h.new_status as GrievanceStatusType,
      timestamp: formatDate(h.created_at),
      description: h.reason || undefined,
      isCurrent,
      isCompleted,
    };
  });

  // If history was empty, create an initial event from grievance.created_at
  if (timelineItems.length === 0 && grievance) {
    timelineItems.push({
      id: 'init-event',
      title: 'Complaint Submitted & Registered',
      status: grievance.status as GrievanceStatusType,
      timestamp: formatDate(grievance.created_at),
      description: 'Complaint registered into institutional queue.',
      isCurrent: true,
      isCompleted: false,
    });
  }

  const isVerificationPending =
    grievance?.status === 'STUDENT_VERIFICATION' || grievance?.status === 'RESOLUTION_PROPOSED';

  return (
    <StudentShell activePath="/student/grievances">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = '/student/grievances')}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to My Grievances
          </Button>

          {grievance && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button
                variant="outline"
                size="sm"
                pill
                onClick={() => window.print()}
                leftIcon={<Printer size={16} />}
              >
                Print Ticket
              </Button>
            </div>
          )}
        </div>

        {/* Global Notifications */}
        {actionSuccessMessage && (
          <Alert type="success" onClose={() => setActionSuccessMessage(null)}>
            {actionSuccessMessage}
          </Alert>
        )}

        {isLoading ? (
          <GrievanceDetailSkeleton />
        ) : errorMessage || !grievance ? (
          <ErrorState
            variant="not_found"
            title="Grievance Record Not Found"
            message={errorMessage || 'The requested ticket could not be found or you do not have permission to access it.'}
            onRetry={loadGrievance}
            secondaryActionLabel="Back to My Grievances"
            onSecondaryAction={() => (window.location.href = '/student/grievances')}
          />
        ) : (
          <>
            {/* =========================================================================
                HEADER CARD: TICKET ID, TITLE, STATUS, PRIORITY, CATEGORY
               ========================================================================= */}
            <Card variant="floating" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: '#1B4332',
                        fontFamily: 'monospace',
                        backgroundColor: '#E8F5E9',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #D8F3DC',
                      }}
                    >
                      {grievance.ticket_number}
                    </span>

                    <StatusBadge status={grievance.status} size="md" />
                    <PriorityBadge priority={grievance.priority} score={grievance.priority_score} size="md" />

                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <FolderOpen size={13} />
                      {grievance.category}
                    </span>

                    {grievance.is_confidential && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#FEF2F2',
                          color: '#991B1B',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Lock size={12} />
                        Confidential
                      </span>
                    )}

                    {grievance.is_anonymous && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: '#F3F4F6',
                          color: '#4B5563',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <User size={12} />
                        Anonymous
                      </span>
                    )}
                  </div>

                  <SlaIndicator slaStatus={grievance.sla_status} size="md" />
                </div>

                <div>
                  <h1
                    style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                      fontWeight: 800,
                      color: '#111827',
                      lineHeight: 1.35,
                    }}
                  >
                    {grievance.title}
                  </h1>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: '#6B7280' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Landmark size={14} color="#1B4332" /> Department: <strong>{grievance.department?.name || 'Assigned Department'}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} /> Submitted: <strong>{formatDate(grievance.created_at)}</strong>
                    </span>
                    {grievance.updated_at && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <RefreshCw size={14} /> Last Updated: <strong>{formatDate(grievance.updated_at)}</strong>
                      </span>
                    )}
                  </div>

                  {/* Live Dynamic SLA Countdown Bar */}
                  <div style={{ marginTop: '1rem' }}>
                    <DynamicSlaBar slaStatus={grievance.sla_status} compact={false} />
                  </div>
                </div>
              </div>
            </Card>

            {/* =========================================================================
                AGENTIC NEXT ACTION BANNER (Clear Stakeholder Ownership)
               ========================================================================= */}
            <NextActionCard
              status={grievance.status}
              isSlaWarning={grievance.sla_status?.isWarning}
              isSlaBreached={grievance.sla_status?.isOverdue}
              assigneeName={grievance.assignee?.full_name}
              departmentName={grievance.department?.name}
              onStudentAction={
                isVerificationPending
                  ? () => {
                      const el = document.getElementById('proposed-resolution-banner');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  : undefined
              }
              actionButtonText={isVerificationPending ? 'Review Proposed Resolution ↓' : undefined}
            />

            {/* =========================================================================
                CURRENT STATE AT A GLANCE (4 QUESTIONS UX)
               ========================================================================= */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              <div style={{ backgroundColor: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  1. What Happened?
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', lineHeight: 1.4, display: 'block' }}>
                  {grievance.category} Issue ({grievance.priority} Priority)
                </span>
                <span style={{ fontSize: '0.78rem', color: '#4B5563' }}>
                  {grievance.location || 'Campus Grounds'}
                </span>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  2. Who Handled It?
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1B4332', display: 'block' }}>
                  {grievance.department?.name || 'Institutional Office'}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#4B5563' }}>
                  {grievance.assignee ? `Officer: ${grievance.assignee.full_name}` : 'Queued for Officer Assignment'}
                </span>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  3. Where Is It Now?
                </span>
                <div style={{ marginTop: '0.2rem' }}>
                  <StatusBadge status={grievance.status} size="sm" />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem', display: 'block' }}>
                  SLA Target: {grievance.sla_hours || 24}h Window
                </span>
              </div>

              <div style={{ backgroundColor: isVerificationPending ? '#FEFCE8' : '#F0FDF4', padding: '1rem 1.25rem', borderRadius: '16px', border: isVerificationPending ? '1px solid #FEF08A' : '1px solid #DCFCE7' }}>
                <span style={{ fontSize: '0.75rem', color: isVerificationPending ? '#92400E' : '#166534', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  4. What Do I Need To Do?
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isVerificationPending ? '#B45309' : '#15803D', lineHeight: 1.4, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {isVerificationPending ? (
                    <>
                      <AlertTriangle size={15} /> Review & Verify Resolution
                    </>
                  ) : grievance.status === 'CLOSED' ? (
                    <>
                      <Check size={15} /> No action needed. Ticket closed.
                    </>
                  ) : (
                    <>
                      <Clock size={15} /> Awaiting Department Action
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* =========================================================================
                PROPOSED RESOLUTION BANNER (When Awaiting Student Verification)
               ========================================================================= */}
            {isVerificationPending && (
              <div
                id="proposed-resolution-banner"
                style={{
                  backgroundColor: '#FFFBEB',
                  borderRadius: '20px',
                  border: '2px solid #F59E0B',
                  padding: '1.75rem',
                  boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Lightbulb size={24} color="#D97706" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#92400E' }}>
                        Resolution Proposed by Officer - Verification Required
                      </h3>
                      <span style={{ fontSize: '0.8125rem', color: '#B45309' }}>
                        The assigned officer has submitted a resolution. Your confirmation is required to close this ticket or reopen if unresolved.
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.3rem 0.65rem', borderRadius: '8px' }}>
                    Student Verification Required
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: '1px solid #FDE68A',
                    fontSize: '0.9375rem',
                    color: '#1F2937',
                    lineHeight: 1.6,
                  }}
                >
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#92400E', fontSize: '0.8125rem', textTransform: 'uppercase' }}>
                    Officer Resolution Notes:
                  </p>
                  {grievance.resolution_notes || 'The department has marked this problem as resolved. Please test and confirm resolution.'}
                </div>

                {/* Resolution Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button
                    variant="primary"
                    size="md"
                    pill
                    isLoading={isSubmittingVerify}
                    onClick={() => handleVerifyResolution(true)}
                    rightIcon={<Check size={16} />}
                  >
                    Accept & Close
                  </Button>

                  <Button
                    variant="danger"
                    size="md"
                    pill
                    onClick={() => {
                      setVerifyError(null);
                      setIsReopenModalOpen(true);
                    }}
                    leftIcon={<X size={16} />}
                  >
                    Reject & Reopen
                  </Button>
                </div>
              </div>
            )}

            {/* Feedback Invitation Banner (When Grievance is Closed) */}
            {grievance.status === 'CLOSED' && (
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  borderRadius: '20px',
                  border: '1px solid #A7F3D0',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Star size={26} color="#059669" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#065F46' }}>
                      How was your resolution experience?
                    </h4>
                    <span style={{ fontSize: '0.8125rem', color: '#047857' }}>
                      Your feedback helps evaluate department SLAs and improve campus facilities.
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  pill
                  onClick={() => (window.location.href = `/student/feedback?grievanceId=${grievance.id}`)}
                  rightIcon={<Star size={16} />}
                >
                  Rate & Review Resolution
                </Button>
              </div>
            )}

            {/* =========================================================================
                TWO-COLUMN DETAILED BODY (MAIN CONTENT + SIDEBAR)
               ========================================================================= */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.75rem',
                alignItems: 'start',
              }}
            >
              
              {/* LEFT COLUMN: DESCRIPTION, ATTACHMENTS, COMMENTS STREAM */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                
                {/* 1. Full Description & Parameters Card */}
                <Card variant="floating" style={{ padding: '1.75rem' }}>
                  <CardHeader>
                    <CardTitle style={{ fontSize: '1.2rem', color: '#1B4332' }}>Complaint Description</CardTitle>
                    <CardDescription>Full student explanation and parameters submitted to the institution</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.65, whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                      {grievance.description}
                    </div>

                    {/* Metadata Badges Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.75rem',
                        backgroundColor: '#F9FAFB',
                        padding: '1rem',
                        borderRadius: '14px',
                        border: '1px solid #E5E7EB',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <div>
                        <span style={{ color: '#6B7280', display: 'block' }}>Location:</span>
                        <strong style={{ color: '#111827' }}>{grievance.location || 'Not specified'}</strong>
                      </div>

                      <div>
                        <span style={{ color: '#6B7280', display: 'block' }}>Cohort Impact:</span>
                        <strong style={{ color: '#111827' }}>{grievance.affected_students || 1} Student(s)</strong>
                      </div>

                      <div>
                        <span style={{ color: '#6B7280', display: 'block' }}>Recurrence:</span>
                        <strong style={{ color: grievance.recurrence ? '#DC2626' : '#111827' }}>
                          {grievance.recurrence ? 'Yes (Repeated Issue)' : 'No (First Incident)'}
                        </strong>
                      </div>

                      <div>
                        <span style={{ color: '#6B7280', display: 'block' }}>Priority Score:</span>
                        <strong style={{ color: '#2D6A4F' }}>{grievance.priority_score || 50}/100 Calculated</strong>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Attachments Section (If Any Attachments Exist) */}
                {grievance.attachments && grievance.attachments.length > 0 && (
                  <Card variant="floating" style={{ padding: '1.75rem' }}>
                    <CardHeader>
                      <CardTitle style={{ fontSize: '1.15rem', color: '#1B4332' }}>Attached Files ({grievance.attachments.length})</CardTitle>
                      <CardDescription>Verified attachments submitted with this ticket</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {grievance.attachments.map((att) => {
                          const isImg = att.file_type.includes('image');
                          const isPdf = att.file_type.includes('pdf');

                          return (
                            <div
                              key={att.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.85rem 1rem',
                                backgroundColor: '#F8FAF8',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {isImg ? <ImageIcon size={20} color="#2D6A4F" /> : isPdf ? <FileText size={20} color="#DC2626" /> : <Paperclip size={20} color="#4B5563" />}
                                </div>
                                <div>
                                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1F2937', display: 'block' }}>
                                    {att.file_name}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                    {formatFileSize(att.file_size)} • Uploaded {formatDate(att.created_at)}
                                  </span>
                                </div>
                              </div>

                              <a
                                href={att.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: '0.8125rem',
                                  fontWeight: 600,
                                  color: '#2D6A4F',
                                  textDecoration: 'none',
                                  padding: '0.35rem 0.75rem',
                                  backgroundColor: '#E8F5E9',
                                  borderRadius: '6px',
                                  border: '1px solid #D8F3DC',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                View File <ExternalLink size={12} />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 3. Discussion & Comment Stream */}
                <Card variant="floating" style={{ padding: '1.75rem' }}>
                  <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <CardTitle style={{ fontSize: '1.15rem', color: '#1B4332' }}>Discussion Stream</CardTitle>
                        <CardDescription>Direct, logged communication between student and department officer</CardDescription>
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4B5563', backgroundColor: '#F3F4F6', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                        {comments.length} Comments
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Comments List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      {comments.length === 0 ? (
                        <EmptyState variant="comments" />
                      ) : (
                        comments.map((c) => {
                          const isStaff = c.author?.role === 'DEPARTMENT_OFFICER' || c.author?.role === 'ADMIN';

                          return (
                            <div
                              key={c.id}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                padding: '1rem',
                                borderRadius: '14px',
                                backgroundColor: isStaff ? '#F0FDF4' : '#F9FAFB',
                                border: isStaff ? '1px solid #DCFCE7' : '1px solid #E5E7EB',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isStaff ? '#1B4332' : '#111827' }}>
                                    {c.author?.full_name || (isStaff ? 'Department Officer' : 'Student')}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      padding: '0.15rem 0.45rem',
                                      borderRadius: '4px',
                                      backgroundColor: isStaff ? '#2D6A4F' : '#E5E7EB',
                                      color: isStaff ? '#FFFFFF' : '#374151',
                                    }}
                                  >
                                    {isStaff ? (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                        <Landmark size={11} /> Officer
                                      </span>
                                    ) : (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                        <GraduationCap size={11} /> Student
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                  {formatDate(c.created_at)}
                                </span>
                              </div>

                              <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                {c.message}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #E5E7EB', paddingTop: '1.25rem' }}>
                      <Textarea
                        placeholder="Add an update or question for the department officer..."
                        rows={3}
                        value={newCommentMessage}
                        onChange={(e) => setNewCommentMessage(e.target.value)}
                        disabled={grievance.status === 'CLOSED'}
                      />

                      {commentError && (
                        <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>
                          {commentError}
                        </span>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          pill
                          disabled={!newCommentMessage.trim() || grievance.status === 'CLOSED'}
                          isLoading={isSubmittingComment}
                          onClick={handlePostComment}
                          rightIcon={<Send size={15} />}
                        >
                          Post Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* RIGHT COLUMN: SLA STATUS, DEPARTMENT, TIMELINE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                
                {/* 1. Live SLA Countdown & Health Card */}
                <Card variant="floating" style={{ padding: '1.5rem' }}>
                  <CardHeader>
                    <CardTitle style={{ fontSize: '1.1rem', color: '#1B4332' }}>SLA Target & Countdown</CardTitle>
                    <CardDescription>Guaranteed institutional resolution window</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>SLA Health:</span>
                        <SlaIndicator slaStatus={grievance.sla_status} size="sm" />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>Target Window:</span>
                        <strong style={{ fontSize: '0.875rem', color: '#111827', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {grievance.sla_hours || 24} Hours
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>Resolution Target:</span>
                        <strong style={{ fontSize: '0.8125rem', color: '#2D6A4F' }}>
                          {formatDate(grievance.due_at)}
                        </strong>
                      </div>

                      {/* Percentage Elapsed Progress Bar */}
                      {grievance.sla_status && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#6B7280' }}>
                            <span>Consumed Time</span>
                            <strong>{Math.min(100, grievance.sla_status.elapsedPercent)}%</strong>
                          </div>
                          <ProgressBar
                            value={Math.min(100, grievance.sla_status.elapsedPercent)}
                            max={100}
                            variant={
                              grievance.sla_status.isOverdue
                                ? 'rose'
                                : grievance.sla_status.isWarning
                                ? 'amber'
                                : 'emerald'
                            }
                            height="8px"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Assigned Department & Officer Card */}
                <Card variant="floating" style={{ padding: '1.5rem' }}>
                  <CardHeader>
                    <CardTitle style={{ fontSize: '1.1rem', color: '#1B4332' }}>Assigned Department</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            backgroundColor: '#E8F5E9',
                            color: '#1B4332',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Landmark size={22} color="#1B4332" />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.9375rem', color: '#111827', display: 'block' }}>
                            {grievance.department?.name || 'Assigned Department'}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            Code: {grievance.department?.code || 'GEN'}
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem', fontSize: '0.8125rem' }}>
                        <span style={{ color: '#6B7280', display: 'block', marginBottom: '0.25rem' }}>Assigned Officer:</span>
                        {grievance.assignee ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} color="#4B5563" />
                            <div>
                              <strong style={{ color: '#111827' }}>{grievance.assignee.full_name}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block' }}>{grievance.assignee.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
                            Unassigned (Queued in department pool)
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. AI Institutional Triage & Explainability Card */}
                <AiReasoningCard
                  analysis={{
                    category: grievance.category,
                    subcategory: grievance.subcategory,
                    severity: grievance.severity || 'MODERATE',
                    urgency: grievance.urgency || 'MEDIUM',
                    priority: grievance.priority,
                    priorityScore: grievance.priority_score,
                    priorityReasons:
                      grievance.priority_reasons && grievance.priority_reasons.length > 0
                        ? grievance.priority_reasons
                        : [
                            `Classified under ${grievance.category} category`,
                            `Target resolution window: ${grievance.sla_hours || 24} hours baseline`,
                            `Assessed urgency: ${grievance.urgency || 'MEDIUM'}`,
                          ],
                    department: grievance.department?.name || 'Assigned Department',
                    summary: grievance.ai_summary || `${grievance.title}: ${grievance.description.slice(0, 140)}...`,
                    confidence: typeof grievance.ai_confidence === 'number' ? grievance.ai_confidence : 0.88,
                  }}
                  isAiEnhanced={true}
                  titleOverride="AI Triage & Explainability"
                />

                {/* 4. Vertical Status History Timeline */}
                <Card variant="floating" style={{ padding: '1.5rem' }}>
                  <CardHeader>
                    <CardTitle style={{ fontSize: '1.1rem', color: '#1B4332' }}>Lifecycle Audit Timeline</CardTitle>
                    <CardDescription>Chronological events logged by the institution</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Timeline items={timelineItems} />
                  </CardContent>
                </Card>

              </div>
            </div>

            {/* =========================================================================
                REOPEN GRIEVANCE MODAL DIALOG
               ========================================================================= */}
            <Modal
              isOpen={isReopenModalOpen}
              onClose={() => setIsReopenModalOpen(false)}
              title="Reject Resolution & Reopen Grievance"
              description="Please specify why the proposed resolution is insufficient so the department officer can address your feedback."
              maxWidth="500px"
              footer={
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReopenModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    pill
                    isLoading={isSubmittingVerify}
                    onClick={() => handleVerifyResolution(false)}
                  >
                    Confirm Reopen Ticket
                  </Button>
                </div>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <Textarea
                  label="Reason for Reopening (Minimum 5 characters)"
                  required
                  rows={4}
                  placeholder="e.g. The Wi-Fi works near the entrance, but workstations 40 to 60 at the back of the lab still cannot connect to the server."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  errorMessage={verifyError || undefined}
                  helperText={`${reopenReason.length} characters (minimum 5 required)`}
                />
              </div>
            </Modal>
          </>
        )}

      </div>
    </StudentShell>
  );
};
