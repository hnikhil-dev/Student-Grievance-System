'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StudentShell,
  useStudentShell,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  MetricCard,
  StatusBadge,
  PriorityBadge,
  SlaIndicator,
  DynamicSlaBar,
  Alert,
  Modal,
  Input,
  Textarea,
  EmptyState,
  CardSkeleton,
  TableSkeleton,
  ErrorState,
  AiBadge,
} from '../index';
import {
  Sparkles,
  GraduationCap,
  Activity,
  RefreshCw,
  Plus,
  ArrowRight,
  ClipboardList,
  Inbox,
  Settings,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Bell,
  Check,
  X,
  FileText,
  Bot,
  Zap,
  Building2,
  Star,
} from 'lucide-react';
import { useRealtimeGrievances } from '@lib/useRealtime';
import { getDynamicAuthHeaders } from '@lib/api';

interface GrievanceItem {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority_score: number;
  priority_reasons: string[];
  status: string;
  department?: { id: string; name: string; code: string } | null;
  assignee?: { id: string; full_name: string; email: string } | null;
  location?: string | null;
  affected_students?: number;
  sla_hours?: number;
  due_at?: string;
  resolved_at?: string | null;
  resolution_notes?: string | null;
  ai_summary?: string | null;
  ai_confidence?: number | null;
  created_at: string;
  updated_at?: string;
  sla_status?: {
    remainingMinutes: number;
    elapsedPercent: number;
    isOverdue: boolean;
    isWarning: boolean;
    slaHours: number;
    dueAt: string;
  };
}

export const StudentDashboardContent: React.FC = () => {
  const { user } = useStudentShell();
  const [grievances, setGrievances] = useState<GrievanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Closed-Loop Verification & Reopen State
  const [selectedGrievance, setSelectedGrievance] = useState<GrievanceItem | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Feedback Star Rating Dialog State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackGrievance, setFeedbackGrievance] = useState<GrievanceItem | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);

  // Fetch Grievances from actual API GET /api/grievances/my
  const fetchGrievances = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/grievances/my', {
        headers: getDynamicAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        setGrievances(json.data || []);
      } else {
        setError(json.error?.message || 'Failed to load grievances');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to campus grievance server');
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  // Real-time Updates: Subscribe to table `grievances` via Supabase WebSocket
  useRealtimeGrievances((payload) => {
    console.log('[Realtime WebSocket] Received change in grievances:', payload);
    // Silent re-fetch updates the list and dynamic countdowns live
    fetchGrievances(true);
  });

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = grievances.length;
    const open = grievances.filter((g) => ['SUBMITTED', 'UNDER_REVIEW'].includes(g.status)).length;
    const inProgress = grievances.filter((g) => ['ASSIGNED', 'IN_PROGRESS', 'ESCALATED'].includes(g.status)).length;
    const resolved = grievances.filter((g) => ['RESOLVED', 'CLOSED'].includes(g.status)).length;
    const needsAttention = grievances.filter(
      (g) =>
        ['STUDENT_VERIFICATION', 'RESOLUTION_PROPOSED', 'REOPENED'].includes(g.status) ||
        (g.sla_status && (g.sla_status.isWarning || g.sla_status.isOverdue))
    ).length;

    return { total, open, inProgress, resolved, needsAttention };
  }, [grievances]);

  // Tickets needing student attention (Awaiting student verification or SLA warning)
  const attentionTickets = useMemo(() => {
    return grievances.filter(
      (g) =>
        ['STUDENT_VERIFICATION', 'RESOLUTION_PROPOSED'].includes(g.status) ||
        (g.sla_status && (g.sla_status.isWarning || g.sla_status.isOverdue))
    );
  }, [grievances]);

  // Latest Grievance for AI Insight
  const latestAiGrievance = useMemo(() => {
    if (grievances.length === 0) return null;
    return grievances[0];
  }, [grievances]);

  // Filtered grievances for list
  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      const matchesSearch =
        searchQuery === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'OPEN' && ['SUBMITTED', 'UNDER_REVIEW'].includes(g.status)) ||
        (statusFilter === 'IN_PROGRESS' && ['ASSIGNED', 'IN_PROGRESS', 'ESCALATED'].includes(g.status)) ||
        (statusFilter === 'VERIFICATION' && ['STUDENT_VERIFICATION', 'RESOLUTION_PROPOSED'].includes(g.status)) ||
        (statusFilter === 'CLOSED' && ['RESOLVED', 'CLOSED'].includes(g.status));

      return matchesSearch && matchesStatus;
    });
  }, [grievances, searchQuery, statusFilter]);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Handle Closed-Loop Verification: Accept & Close OR Reject & Reopen
  const handleVerifyResolution = async (grievanceId: string, accepted: boolean) => {
    setIsSubmittingVerify(true);
    try {
      const res = await fetch(`/api/grievances/${grievanceId}/verify`, {
        method: 'POST',
        headers: getDynamicAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          accepted,
          reason: accepted ? undefined : reopenReason,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsVerifyModalOpen(false);
        setReopenReason('');
        
        const targetTicket = grievances.find((g) => g.id === grievanceId);

        if (accepted) {
          setActionSuccessMessage(
            'Resolution accepted successfully! Grievance marked as CLOSED. Please rate your experience below.'
          );
          // Automatically open the Feedback Star Rating Dialog to complete the loop
          if (targetTicket) {
            setFeedbackGrievance(targetTicket);
            setFeedbackRating(5);
            setFeedbackComment('');
            setIsFeedbackModalOpen(true);
          }
        } else {
          setActionSuccessMessage(
            'Grievance reopened and routed back to the department officer with your explanation.'
          );
        }

        setSelectedGrievance(null);
        await fetchGrievances(true);
      } else {
        alert(json.error?.message || 'Verification update failed.');
      }
    } catch (err: any) {
      alert('Verification update error: ' + err.message);
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  // Handle Submitting 1-5 Star Feedback: POST /api/grievances/:id/feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackGrievance) return;
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/grievances/${feedbackGrievance.id}/feedback`, {
        method: 'POST',
        headers: getDynamicAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionSuccessMessage(
          `Thank you! Your ${feedbackRating}-star rating & feedback have been recorded for ${feedbackGrievance.ticket_number}.`
        );
        setIsFeedbackModalOpen(false);
        setFeedbackGrievance(null);
        setFeedbackComment('');
        await fetchGrievances(true);
      } else {
        alert(json.error?.message || 'Feedback submission failed. Grievance must be closed.');
      }
    } catch (err: any) {
      alert('Feedback submission error: ' + err.message);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const ratingDescriptions: Record<number, string> = {
    5: 'Exceptional (5/5) – Fast, attentive, and fully resolved',
    4: 'Good (4/5) – Issue resolved effectively with minor delay',
    3: 'Satisfactory (3/5) – Acceptable resolution provided',
    2: 'Needs Improvement (2/5) – Slow response or partial solution',
    1: 'Unsatisfactory (1/5) – Unresolved or unacceptable handling',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Header Greeting & Primary Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <Sparkles size={24} color="#2D6A4F" />
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: '#1B4332',
                letterSpacing: '-0.02em',
              }}
            >
              {greeting}, {user?.full_name || 'Student'}!
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#4B5563' }}>
            Live SLA Countdown Tracking & Closed-Loop Resolution Verification Portal.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {user?.student_id && (
              <span style={{ fontSize: '0.75rem', backgroundColor: '#E8F5E9', color: '#1B4332', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, border: '1px solid #D8F3DC', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <GraduationCap size={13} /> ID: {user.student_id}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', backgroundColor: '#F0FDF4', color: '#15803D', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 600, border: '1px solid #BBF7D0', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Activity size={13} /> Live Realtime: Active
            </span>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#F3F4F6', color: '#4B5563', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 600 }}>
              {user?.role ? `Role: ${user.role}` : 'Campus Student Portal'}
            </span>
          </div>
        </div>

        {/* Primary CTA: Report a New Grievance */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="md"
            pill
            onClick={() => fetchGrievances(false)}
            leftIcon={<RefreshCw size={15} />}
          >
            Refresh Live Data
          </Button>
          <Button
            variant="primary"
            size="lg"
            pill
            onClick={() => (window.location.href = '/student/report')}
            leftIcon={<Plus size={16} />}
            rightIcon={<ArrowRight size={16} />}
          >
            Report a New Grievance
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <Alert
          type="success"
          onClose={() => setActionSuccessMessage(null)}
        >
          {actionSuccessMessage}
        </Alert>
      )}

      {/* 2. Summary Metric Cards */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          title="Could Not Load Metrics"
          message={error}
          onRetry={() => fetchGrievances(false)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <MetricCard
            data={{
              title: 'Total Grievances',
              value: metrics.total,
              subtitle: 'All complaints logged',
              icon: <ClipboardList size={18} />,
              variant: 'neutral',
            }}
          />
          <MetricCard
            data={{
              title: 'Open / Review',
              value: metrics.open,
              subtitle: 'Awaiting assignment',
              icon: <Inbox size={18} />,
              variant: 'indigo',
            }}
          />
          <MetricCard
            data={{
              title: 'In Progress',
              value: metrics.inProgress,
              subtitle: 'Officers active',
              icon: <Settings size={18} />,
              variant: 'emerald',
            }}
          />
          <MetricCard
            data={{
              title: 'Closed & Verified',
              value: metrics.resolved,
              subtitle: 'Completed resolutions',
              icon: <CheckCircle2 size={18} />,
              variant: 'emerald',
            }}
          />
          <MetricCard
            data={{
              title: 'Needs Attention',
              value: metrics.needsAttention,
              subtitle: metrics.needsAttention > 0 ? 'Verification or SLA risk' : 'All on track',
              icon: <AlertTriangle size={18} />,
              variant: metrics.needsAttention > 0 ? 'amber' : 'neutral',
            }}
          />
        </div>
      )}

      {/* 3. CLOSED-LOOP STUDENT VERIFICATION BANNER & ATTENTION AREA */}
      {!isLoading && attentionTickets.length > 0 && (
        <Card
            variant="floating"
            style={{
            backgroundColor: '#FFFBEB',
            borderColor: '#F59E0B',
            borderWidth: '2px',
            padding: '1.5rem',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertOctagon size={24} color="#DC2626" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#92400E' }}>
                  Action Required on Your Grievances ({attentionTickets.length})
                </h3>
                <span style={{ fontSize: '0.8125rem', color: '#B45309' }}>
                  Officers have proposed resolutions requiring your verification, or SLA thresholds require attention.
                </span>
              </div>
            </div>

            <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#FDE68A', color: '#78350F', padding: '0.25rem 0.65rem', borderRadius: '8px' }}>
              Closed-Loop Enforcement
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {attentionTickets.map((ticket) => {
              const isVerificationNeeded = ['STUDENT_VERIFICATION', 'RESOLUTION_PROPOSED'].includes(ticket.status);

              return (
                <div
                  key={ticket.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid #FDE68A',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {/* Closed-Loop Verification Alert Banner */}
                  {isVerificationNeeded && (
                    <div
                      style={{
                        backgroundColor: '#FEF3C7',
                        border: '2px solid #F59E0B',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Bell size={22} color="#D97706" />
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#92400E' }}>
                            Resolution Proposed by Officer - Verification Required
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: '#B45309' }}>
                            Your confirmation is strictly required to close this ticket or reopen if inadequate.
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        {/* Action 1: Accept & Close */}
                        <Button
                          variant="primary"
                          size="sm"
                          pill
                          isLoading={isSubmittingVerify}
                          onClick={() => handleVerifyResolution(ticket.id, true)}
                          leftIcon={<Check size={14} />}
                        >
                          Accept & Close
                        </Button>

                        {/* Action 2: Reject & Reopen */}
                        <Button
                          variant="danger"
                          size="sm"
                          pill
                          onClick={() => {
                            setSelectedGrievance(ticket);
                            setIsVerifyModalOpen(true);
                          }}
                          leftIcon={<X size={14} />}
                        >
                          Reject & Reopen
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Header Title & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1B4332' }}>
                          {ticket.ticket_number}
                        </span>
                        <StatusBadge status={ticket.status} size="sm" />
                        <PriorityBadge priority={ticket.priority} score={ticket.priority_score} size="sm" />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
                        {ticket.title}
                      </h4>
                    </div>

                    <SlaIndicator slaStatus={ticket.sla_status} size="sm" />
                  </div>

                  {/* Dynamic SLA Countdown Bar */}
                  <DynamicSlaBar slaStatus={ticket.sla_status} compact={false} />

                  {/* Proposed Officer Resolution Details */}
                  {isVerificationNeeded && (
                    <div style={{ backgroundColor: '#F0FDFA', padding: '1rem', borderRadius: '12px', border: '1px solid #99F6E4', fontSize: '0.875rem' }}>
                      <strong style={{ color: '#0F766E', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <FileText size={15} /> Officer Resolution Summary:
                      </strong>
                      <p style={{ margin: 0, color: '#134E4A', lineHeight: 1.5 }}>
                        {ticket.resolution_notes || 'The assigned department officer has completed corrective action and marked the resolution ready for student inspection.'}
                      </p>
                    </div>
                  )}

                  {/* Card bottom navigation */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (window.location.href = `/student/grievances/${ticket.id}`)}
                      rightIcon={<ArrowRight size={14} />}
                    >
                      View Full Audit Trail & Evidence
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 4. AI Institutional Intelligence Insight */}
      {!isLoading && latestAiGrievance && (
        <Card
          variant="floating"
          style={{
            backgroundColor: '#F8FAFC',
            borderColor: '#C7D2FE',
            borderWidth: '1px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={22} color="#4F46E5" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>
                AI Institutional Intelligence Insight
              </h3>
            </div>
            <AiBadge label="Gemini Priority Engine" confidence={latestAiGrievance.ai_confidence ?? undefined} variant="indigo" />
          </div>

          <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
            Your latest ticket <strong>{latestAiGrievance.ticket_number}</strong> was classified as{' '}
            <strong style={{ color: '#1B4332' }}>{latestAiGrievance.priority}</strong> priority (Score:{' '}
            {latestAiGrievance.priority_score}/100) with an automated SLA duration of{' '}
            <strong>{latestAiGrievance.sla_hours ? `${latestAiGrievance.sla_hours} hours` : 'Standard 24h SLA'}</strong>. Routed to{' '}
            <strong>{latestAiGrievance.department?.name || latestAiGrievance.category}</strong>.
          </p>

          {latestAiGrievance.priority_reasons && latestAiGrievance.priority_reasons.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {latestAiGrievance.priority_reasons.slice(0, 3).map((r, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: '#EEF2FF',
                    color: '#3730A3',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    border: '1px solid #E0E7FF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Zap size={12} color="#4F46E5" /> {r}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* 5. LIVE TICKET TRACKING & RECENT GRIEVANCES LIST */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
              Live Grievance Tracking & Dynamic SLAs
            </h2>
            <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
              Showing {filteredGrievances.length} of {grievances.length} total tickets (Auto-updating via Supabase Realtime)
            </span>
          </div>

          {/* Search & Status Filter Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '0.875rem',
                outline: 'none',
                width: '200px',
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open / Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="VERIFICATION">Awaiting Verification</option>
              <option value="CLOSED">Closed & Resolved</option>
            </select>
          </div>
        </div>

        {/* Content States: Loading, Error, Empty, or Grievance List */}
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : error ? (
          <ErrorState
            variant="api"
            title="Unable to Load Recent Grievances"
            message={error}
            onRetry={() => fetchGrievances(false)}
          />
        ) : grievances.length === 0 ? (
          <EmptyState
            variant="grievances"
            onAction={() => (window.location.href = '/student/report')}
          />
        ) : filteredGrievances.length === 0 ? (
          <EmptyState
            variant="search"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredGrievances.map((g) => (
              <Card
                key={g.id}
                variant="interactive"
                className="sg-animate-slide-up sg-action-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderRadius: '16px',
                }}
                onClick={() => (window.location.href = `/student/grievances/${g.id}`)}
              >
                {/* Header row: Ticket number, category, badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1B4332' }}>
                        {g.ticket_number}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>•</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', backgroundColor: '#F3F4F6', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {g.category}
                      </span>
                      {g.department && (
                        <span style={{ fontSize: '0.75rem', color: '#0369A1', backgroundColor: '#F0F9FF', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Building2 size={12} /> {g.department.name}
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>
                      {g.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['STUDENT_VERIFICATION', 'RESOLUTION_PROPOSED'].includes(g.status) ? (
                      <span
                        className="sg-animate-pulse-soft"
                        style={{
                          padding: '0.2rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FCD34D',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <CheckCircle2 size={13} /> Verification Required
                      </span>
                    ) : null}
                    <StatusBadge status={g.status} size="sm" />
                    <PriorityBadge priority={g.priority} score={g.priority_score} size="sm" />
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.5, maxHeight: '2.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {g.description}
                </p>

                {/* Dynamic SLA Countdown Bar for every ticket */}
                <DynamicSlaBar slaStatus={g.sla_status} compact={true} />

                {/* Card Footer: Assigned Officer, Feedback Prompt for CLOSED tickets */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #F3F4F6',
                    paddingTop: '0.75rem',
                    fontSize: '0.8125rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {g.assignee ? (
                      <span style={{ color: '#4B5563' }}>
                        Officer: <strong>{g.assignee.full_name}</strong>
                      </span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>Officer: Awaiting Assignment</span>
                    )}

                    {/* Quick rate resolution button if closed */}
                    {['CLOSED', 'RESOLVED'].includes(g.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFeedbackGrievance(g);
                          setFeedbackRating(5);
                          setFeedbackComment('');
                          setIsFeedbackModalOpen(true);
                        }}
                        style={{
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FCD34D',
                          borderRadius: '6px',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Star size={12} fill="#D97706" color="#D97706" /> Rate Resolution
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                      Logged {new Date(g.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ fontWeight: 700, color: '#2D6A4F', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      View Details <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 6. MODAL: Closed-Loop Rejection / Reopen Dialog */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => {
          setIsVerifyModalOpen(false);
          setReopenReason('');
          setSelectedGrievance(null);
        }}
        title={`Reject & Reopen Grievance: ${selectedGrievance?.ticket_number}`}
        description="Please provide specific reasoning why the proposed resolution does not solve your issue. This explanation will be routed back to the department officer."
        footer={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="outline"
              size="md"
              pill
              onClick={() => setIsVerifyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              pill
              disabled={reopenReason.trim().length < 5 || isSubmittingVerify}
              isLoading={isSubmittingVerify}
              onClick={() => {
                if (selectedGrievance) {
                  handleVerifyResolution(selectedGrievance.id, false);
                }
              }}
            >
              Confirm Reopen Ticket
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Textarea
            label="Reason for Reopening"
            required
            rows={4}
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Explain why the resolution was incomplete (minimum 5 characters)..."
            helperText="A clear, polite description ensures faster corrective action by department officers."
          />
        </div>
      </Modal>

      {/* 7. MODAL: Feedback Star Rating Dialog for Closed Tickets */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setFeedbackGrievance(null);
          setFeedbackComment('');
        }}
        title="Rate Resolution & Close the Loop"
        description={
          feedbackGrievance
            ? `Submit your experience rating for ${feedbackGrievance.ticket_number} - "${feedbackGrievance.title}". Your feedback directly drives campus accountability.`
            : 'Rate your grievance resolution experience.'
        }
        footer={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="outline"
              size="md"
              pill
              onClick={() => setIsFeedbackModalOpen(false)}
            >
              Skip
            </Button>
            <Button
              variant="primary"
              size="md"
              pill
              disabled={isSubmittingFeedback || feedbackRating < 1}
              isLoading={isSubmittingFeedback}
              onClick={handleSubmitFeedback}
              rightIcon={<Star size={16} />}
            >
              Submit Star Rating
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
          {/* Star Rating Interactive Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
              Resolution Satisfaction Rating (1 to 5 Stars):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (feedbackHoverRating || feedbackRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setFeedbackHoverRating(star)}
                    onMouseLeave={() => setFeedbackHoverRating(0)}
                    onClick={() => setFeedbackRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 150ms ease',
                      transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                    }}
                    aria-label={`${star} Star`}
                  >
                    <Star
                      size={28}
                      fill={isFilled ? '#F59E0B' : 'transparent'}
                      color={isFilled ? '#F59E0B' : '#D1D5DB'}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>
              {ratingDescriptions[feedbackHoverRating || feedbackRating] || ''}
            </p>
          </div>

          {/* Comment Textarea */}
          <Textarea
            label="Feedback & Comments (Optional)"
            rows={3}
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder="Share constructive notes about the speed, communication, or quality of the resolution..."
            helperText="Feedback is audited by Campus Administration to ensure SLA compliance."
          />
        </div>
      </Modal>

    </div>
  );
};

export const StudentDashboard: React.FC = () => {
  return (
    <StudentShell activePath="/student/page">
      <StudentDashboardContent />
    </StudentShell>
  );
};
