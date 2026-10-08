'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

  // Verification & Reopen Modal state
  const [selectedGrievance, setSelectedGrievance] = useState<GrievanceItem | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Fetch Grievances from actual API GET /api/grievances/my
  const fetchGrievances = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/grievances/my', {
        headers: {
          'x-demo-user-id': '00000000-0000-0000-0000-000000000006',
          'x-demo-user-role': 'STUDENT',
        },
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

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

  // Handle Resolution Verification (Accept or Reopen)
  const handleVerifyResolution = async (grievanceId: string, accepted: boolean) => {
    setIsSubmittingVerify(true);
    try {
      const res = await fetch(`/api/grievances/${grievanceId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-user-id': '00000000-0000-0000-0000-000000000006',
          'x-demo-user-role': 'STUDENT',
        },
        body: JSON.stringify({
          accepted,
          reason: accepted ? undefined : reopenReason,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionSuccessMessage(
          accepted
            ? '✓ Resolution accepted successfully! Grievance closed.'
            : '✓ Ticket has been reopened and routed back to the department officer.'
        );
        setIsVerifyModalOpen(false);
        setReopenReason('');
        setSelectedGrievance(null);
        // Refresh live data
        await fetchGrievances();
      } else {
        alert(json.error?.message || 'Verification update failed.');
      }
    } catch (err: any) {
      alert('Verification update error: ' + err.message);
    } finally {
      setIsSubmittingVerify(false);
    }
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
            <span style={{ fontSize: '1.75rem' }}>👋</span>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: '#1B4332',
                letterSpacing: '-0.02em',
              }}
            >
              {greeting}, {user?.full_name || 'Alex Mercer'}!
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#4B5563' }}>
            Here is the current status of your campus grievances and live SLA tracking.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#E8F5E9', color: '#1B4332', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, border: '1px solid #D8F3DC' }}>
              🎓 ID: {user?.student_id || 'CS-2023-014'}
            </span>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#F3F4F6', color: '#4B5563', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 600 }}>
              Campus: Main Academic Block
            </span>
          </div>
        </div>

        {/* Primary CTA: Report a New Grievance */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button
            variant="primary"
            size="lg"
            pill
            onClick={() => (window.location.href = '/student/report')}
            leftIcon="➕"
            rightIcon="→"
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
          onRetry={fetchGrievances}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <MetricCard
            data={{
              title: 'Total Grievances',
              value: metrics.total,
              subtitle: 'All complaints logged',
              icon: '📋',
              variant: 'neutral',
            }}
          />
          <MetricCard
            data={{
              title: 'Open / Review',
              value: metrics.open,
              subtitle: 'Awaiting assignment',
              icon: '📥',
              variant: 'indigo',
            }}
          />
          <MetricCard
            data={{
              title: 'In Progress',
              value: metrics.inProgress,
              subtitle: 'Officers active',
              icon: '⚙️',
              variant: 'emerald',
            }}
          />
          <MetricCard
            data={{
              title: 'Closed & Verified',
              value: metrics.resolved,
              subtitle: 'Completed resolutions',
              icon: '✅',
              variant: 'emerald',
            }}
          />
          <MetricCard
            data={{
              title: 'Needs Attention',
              value: metrics.needsAttention,
              subtitle: metrics.needsAttention > 0 ? 'Verification or SLA risk' : 'All on track',
              icon: '⚠️',
              variant: metrics.needsAttention > 0 ? 'amber' : 'neutral',
            }}
          />
        </div>
      )}

      {/* 3. Attention Area (Only shown when applicable) */}
      {!isLoading && attentionTickets.length > 0 && (
        <Card
          variant="floating"
          style={{
            backgroundColor: '#FFFBEB',
            borderColor: '#FDE68A',
            borderWidth: '2px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🚨</span>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#92400E' }}>
              Action Required on Your Grievances ({attentionTickets.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {attentionTickets.map((ticket) => {
              const isVerificationNeeded = ['STUDENT_VERIFICATION', 'RESOLUTION_PROPOSED'].includes(ticket.status);
              const isSlaBreached = ticket.sla_status?.isOverdue;
              const isSlaWarning = ticket.sla_status?.isWarning;

              return (
                <div
                  key={ticket.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    border: '1px solid #FDE68A',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B7280' }}>
                          {ticket.ticket_number}
                        </span>
                        <StatusBadge status={ticket.status} size="sm" />
                        <PriorityBadge priority={ticket.priority} score={ticket.priority_score} size="sm" />
                      </div>
                      <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                        {ticket.title}
                      </h4>
                    </div>

                    <SlaIndicator slaStatus={ticket.sla_status} size="sm" />
                  </div>

                  {/* Resolution Notes if awaiting student verification */}
                  {isVerificationNeeded && (
                    <div style={{ backgroundColor: '#F0FDFA', padding: '0.85rem', borderRadius: '10px', border: '1px solid #99F6E4', fontSize: '0.875rem' }}>
                      <strong style={{ color: '#0F766E' }}>Proposed Officer Resolution:</strong>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#134E4A' }}>
                        {ticket.resolution_notes || 'The assigned campus officer has submitted resolution details. Please confirm if the issue is solved.'}
                      </p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {isVerificationNeeded && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          pill
                          onClick={() => handleVerifyResolution(ticket.id, true)}
                          leftIcon="✓"
                        >
                          Accept Resolution & Close
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          pill
                          onClick={() => {
                            setSelectedGrievance(ticket);
                            setIsVerifyModalOpen(true);
                          }}
                          leftIcon="✕"
                        >
                          Reopen Ticket with Cause
                        </Button>
                      </>
                    )}

                    {(isSlaBreached || isSlaWarning) && !isVerificationNeeded && (
                      <span style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 600 }}>
                        {isSlaBreached
                          ? '🚨 Overdue: This ticket has automatically escalated to the Department Admin.'
                          : '⚠️ SLA Warning: Officer has been alerted to provide updates.'}
                      </span>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (window.location.href = `/student/grievances/${ticket.id}`)}
                      style={{ marginLeft: 'auto' }}
                    >
                      View Full Ticket →
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 4. AI Institutional Insight Area */}
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
              <span style={{ fontSize: '1.25rem' }}>🤖</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>
                AI Institutional Intelligence Insight
              </h3>
            </div>
            <AiBadge label="Gemini Priority Engine" confidence={latestAiGrievance.ai_confidence || 0.92} variant="indigo" />
          </div>

          <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
            Your latest ticket <strong>{latestAiGrievance.ticket_number}</strong> was classified as{' '}
            <strong style={{ color: '#1B4332' }}>{latestAiGrievance.priority}</strong> priority (Score:{' '}
            {latestAiGrievance.priority_score}/100) with an automated SLA duration of{' '}
            <strong>{latestAiGrievance.sla_hours || 24} hours</strong>. Routed to{' '}
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
                  }}
                >
                  ⚡ {r}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* 5. Recent Grievances List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
              Recent Grievances
            </h2>
            <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
              Showing {filteredGrievances.length} of {grievances.length} total tickets
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
            onRetry={fetchGrievances}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredGrievances.map((g) => (
              <Card
                key={g.id}
                variant="interactive"
                className="sg-animate-slide-up sg-action-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
                onClick={() => (window.location.href = `/student/grievances/${g.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#1B4332' }}>
                        {g.ticket_number}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>•</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', backgroundColor: '#F3F4F6', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                        {g.category}
                      </span>
                      {g.department && (
                        <span style={{ fontSize: '0.75rem', color: '#0369A1', backgroundColor: '#F0F9FF', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                          🏛️ {g.department.name}
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
                      {g.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['STUDENT_VERIFICATION', 'RESOLUTION_PROPOSED'].includes(g.status) ? (
                      <span
                        className="sg-animate-pulse-soft"
                        style={{
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FCD34D',
                        }}
                      >
                        👉 Your Action Needed
                      </span>
                    ) : ['ASSIGNED', 'IN_PROGRESS'].includes(g.status) ? (
                      <span
                        style={{
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          backgroundColor: '#EFF6FF',
                          color: '#1E40AF',
                          border: '1px solid #BFDBFE',
                        }}
                      >
                        ⚙️ Dept Active
                      </span>
                    ) : null}
                    <StatusBadge status={g.status} size="sm" />
                    <PriorityBadge priority={g.priority} score={g.priority_score} size="sm" />
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.5, maxHeight: '2.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {g.description}
                </p>

                {/* Card Footer: SLA status, Assigned Officer, Date */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <SlaIndicator slaStatus={g.sla_status} size="sm" />
                    {g.assignee && (
                      <span style={{ color: '#4B5563' }}>
                        Officer: <strong>{g.assignee.full_name}</strong>
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                      Logged {new Date(g.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ fontWeight: 700, color: '#2D6A4F', fontSize: '0.85rem' }}>
                      View Details →
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 6. Reopen / Verification Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => {
          setIsVerifyModalOpen(false);
          setReopenReason('');
          setSelectedGrievance(null);
        }}
        title={`Reopen Grievance: ${selectedGrievance?.ticket_number}`}
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
            helperText="A clear, polite description ensures faster resolution by department officers."
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
