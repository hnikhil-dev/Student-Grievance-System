'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StudentShell,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Textarea,
  Alert,
  StatusBadge,
  PriorityBadge,
  EmptyState,
  ErrorState,
  PageSpinner,
} from '../index';
import { getDynamicAuthHeaders } from '@lib/api';
import {
  Check,
  CheckCircle2,
  Star,
  Frown,
  Meh,
  Smile,
  Sparkles,
  FolderOpen,
  Landmark,
  User,
  Send,
  LayoutDashboard,
  RotateCcw,
} from 'lucide-react';

interface ClosedGrievanceItem {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: any;
  priority_score: number;
  created_at: string;
  resolved_at?: string | null;
  updated_at?: string;
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
}

const RATING_LABELS: Record<number, { title: string; subtitle: string; icon: React.ReactNode }> = {
  1: { title: 'Poor Experience', subtitle: 'Issue was poorly addressed or required excessive escalation.', icon: <Frown size={20} color="#DC2626" /> },
  2: { title: 'Needs Improvement', subtitle: 'Resolved, but communication or speed was subpar.', icon: <Meh size={20} color="#EA580C" /> },
  3: { title: 'Satisfactory', subtitle: 'Standard resolution within acceptable parameters.', icon: <Smile size={20} color="#D97706" /> },
  4: { title: 'Good Experience', subtitle: 'Prompt resolution with helpful communication from the officer.', icon: <Smile size={20} color="#16A34A" /> },
  5: { title: 'Outstanding Service', subtitle: 'Exemplary speed, root-cause resolution, and proactive updates.', icon: <Sparkles size={20} color="#2563EB" /> },
};

const STRUCTURED_REFLECTION_CHIPS = [
  'Resolution was prompt & within SLA',
  'Officer communication was clear & helpful',
  'Problem was thoroughly solved',
  'Resolution took longer than expected',
  'Required multiple follow-up messages',
  'Root cause was addressed',
];

export interface StudentFeedbackProps {
  initialGrievanceId?: string;
}

export const StudentFeedback: React.FC<StudentFeedbackProps> = ({ initialGrievanceId }) => {
  // Grievance Selection State
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string>(initialGrievanceId || '');
  const [closedGrievances, setClosedGrievances] = useState<ClosedGrievanceItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [listError, setListError] = useState<string | null>(null);

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  // Parse grievanceId from URL query param if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qId = urlParams.get('grievanceId') || urlParams.get('id');
      if (qId) {
        setSelectedGrievanceId(qId);
      }
    }
  }, []);

  // Fetch Closed Grievances from Real API: GET /api/grievances/my
  const fetchClosedGrievances = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);

    try {
      const res = await fetch('/api/grievances/my?pageSize=50', {
        headers: getDynamicAuthHeaders(),
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // Filter to grievances that have reached resolution or closure
        const eligible = json.data.filter((g: any) =>
          ['CLOSED', 'RESOLVED'].includes(g.status)
        );
        setClosedGrievances(eligible);

        // If no selected grievance yet and eligible exist, select the first
        if (!selectedGrievanceId && eligible.length > 0) {
          setSelectedGrievanceId(eligible[0].id);
        }
      } else {
        setListError(json.error?.message || 'Failed to load resolved grievances.');
      }
    } catch {
      setListError('Network connection error while retrieving resolved grievances.');
    } finally {
      setIsLoadingList(false);
    }
  }, [selectedGrievanceId]);

  useEffect(() => {
    fetchClosedGrievances();
  }, [fetchClosedGrievances]);

  // Selected Grievance Object
  const currentGrievance = useMemo(() => {
    return closedGrievances.find((g) => g.id === selectedGrievanceId) || null;
  }, [closedGrievances, selectedGrievanceId]);

  // Toggle structured reflection chip
  const handleToggleChip = (chip: string) => {
    let nextChips: string[];
    if (selectedChips.includes(chip)) {
      nextChips = selectedChips.filter((c) => c !== chip);
    } else {
      nextChips = [...selectedChips, chip];
    }
    setSelectedChips(nextChips);

    // Update comment body with chip selection
    const cleanedComment = comment
      .split('\n')
      .filter((line) => !STRUCTURED_REFLECTION_CHIPS.some((sc) => line.includes(sc)))
      .join('\n')
      .trim();

    if (nextChips.length > 0) {
      const chipText = nextChips.map((c) => `• ${c}`).join('\n');
      setComment(cleanedComment ? `${chipText}\n\n${cleanedComment}` : chipText);
    } else {
      setComment(cleanedComment);
    }
  };

  // Submit Feedback to Real API: POST /api/grievances/[id]/feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievanceId) return;

    if (rating < 1 || rating > 5) {
      setSubmitError('Please select a star rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        rating: Number(rating),
        comment: comment.trim() || null,
      };

      const res = await fetch(`/api/grievances/${selectedGrievanceId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getDynamicAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.status === 201 || (json.success && json.data)) {
        setIsSubmittedSuccess(true);
      } else if (res.status === 409) {
        setSubmitError(
          json.error?.message ||
            'Feedback has already been submitted for this grievance. Thank you for helping improve campus operations!'
        );
      } else {
        setSubmitError(json.error?.message || 'Failed to submit feedback. Please verify your ratings.');
      }
    } catch {
      setSubmitError('Network failure occurred during feedback submission. Your input has been preserved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to rate another ticket
  const handleResetForAnother = () => {
    setIsSubmittedSuccess(false);
    setRating(5);
    setComment('');
    setSelectedChips([]);
    setSubmitError(null);
  };

  const activeRatingInfo = RATING_LABELS[hoverRating || rating] || RATING_LABELS[5];

  return (
    <StudentShell activePath="/student/feedback">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '840px', margin: '0 auto' }}>
        
        {/* =========================================================================
            HEADER BANNER
           ========================================================================= */}
        <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.75rem' }}>⭐</span>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                fontWeight: 800,
                color: '#1B4332',
                letterSpacing: '-0.02em',
              }}
            >
              Student Feedback & Quality Rating
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.5 }}>
            Close the loop on your resolved complaints. Your evaluation directly impacts departmental SLA performance and campus service improvement.
          </p>
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <Alert type="error" onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        {isLoadingList ? (
          <PageSpinner label="Loading Resolved Grievances..." />
        ) : listError ? (
          <ErrorState
            title="Unable to Load Resolved Tickets"
            message={listError}
            onRetry={fetchClosedGrievances}
          />
        ) : closedGrievances.length === 0 ? (
          <EmptyState
            variant="feedback"
            onAction={() => (window.location.href = '/student/grievances')}
          />
        ) : isSubmittedSuccess ? (
          /* =========================================================================
              SUCCESS CELEBRATION STATE
             ========================================================================= */
          <Card variant="floating" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '520px', margin: '0 auto' }}>
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  border: '3px solid #A7F3D0',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'sg-bounce 1s ease',
                }}
              >
                <CheckCircle2 size={42} color="#059669" />
              </div>

              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  FEEDBACK OFFICIALLY LOGGED
                </span>
                <h2 style={{ margin: '0.35rem 0 0.5rem 0', fontSize: '2rem', fontWeight: 800, color: '#1B4332' }}>
                  Thank You for Your Voice
                </h2>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#4B5563', lineHeight: 1.6 }}>
                  Your <strong>{rating}-star rating</strong> and comments have been recorded into the institutional Quality Assurance audit. Your feedback directly shapes resource allocation, campus officer accountability, and system SLAs.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                <Button
                  variant="primary"
                  size="md"
                  pill
                  onClick={() => (window.location.href = '/student/page')}
                  rightIcon={<LayoutDashboard size={16} />}
                >
                  Return to Dashboard
                </Button>

                {closedGrievances.length > 1 && (
                  <Button
                    variant="outline"
                    size="md"
                    pill
                    onClick={handleResetForAnother}
                    leftIcon={<RotateCcw size={16} />}
                  >
                    Rate Another Ticket
                  </Button>
                )}
              </div>
            </div>

            <style jsx>{`
              @keyframes sg-bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
            `}</style>
          </Card>
        ) : (
          /* =========================================================================
              FEEDBACK FORM
             ========================================================================= */
          <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1. Grievance Context Selector Card */}
            <Card variant="floating" style={{ padding: '1.75rem' }}>
              <CardHeader>
                <CardTitle style={{ fontSize: '1.15rem', color: '#1B4332' }}>Target Grievance Context</CardTitle>
                <CardDescription>Select the resolved complaint you are reviewing</CardDescription>
              </CardHeader>

              <CardContent>
                {/* Grievance Picker Dropdown if Multiple Exist */}
                {closedGrievances.length > 1 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                      Select Grievance to Rate:
                    </label>
                    <select
                      value={selectedGrievanceId}
                      onChange={(e) => setSelectedGrievanceId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.875rem',
                        color: '#111827',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      {closedGrievances.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.ticket_number} — {g.title} ({g.department?.name || g.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Grievance Context Callout Card */}
                {currentGrievance && (
                  <div
                    style={{
                      backgroundColor: '#F8FAF8',
                      borderRadius: '14px',
                      border: '1px solid #E5E7EB',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: '#1B4332',
                            backgroundColor: '#E8F5E9',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                          }}
                        >
                          {currentGrievance.ticket_number}
                        </span>
                        <StatusBadge status={currentGrievance.status} size="sm" />
                        <PriorityBadge priority={currentGrievance.priority} score={currentGrievance.priority_score} size="sm" />
                      </div>

                      <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FolderOpen size={12} /> {currentGrievance.category}
                      </span>
                    </div>

                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                      {currentGrievance.title}
                    </h4>

                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#6B7280' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Landmark size={12} color="#1B4332" /> Department: <strong>{currentGrievance.department?.name || 'Assigned'}</strong>
                      </span>
                      {currentGrievance.assignee && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} /> Officer: <strong>{currentGrievance.assignee.full_name}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Interactive 5-Star Rating Card */}
            <Card variant="floating" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#1B4332' }}>
                    How would you rate the resolution?
                  </h3>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    Click a star to grade the department officer's handling
                  </span>
                </div>

                {/* 5-Star Interactive Button Strip */}
                <div
                  role="radiogroup"
                  aria-label="Resolution Rating (1 to 5 stars)"
                  style={{ display: 'flex', gap: '0.6rem', margin: '0.5rem 0' }}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;

                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={rating === star}
                        aria-label={`${star} star - ${RATING_LABELS[star].title}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                          transition: 'all 150ms ease',
                          padding: '0.35rem',
                          outline: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Star
                          size={36}
                          fill={isFilled ? '#F59E0B' : 'transparent'}
                          color={isFilled ? '#F59E0B' : '#CBD5E1'}
                          strokeWidth={1.75}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Rating Label Feedback */}
                <div
                  style={{
                    backgroundColor: '#FEFCE8',
                    border: '1px solid #FEF08A',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    maxWidth: '440px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{activeRatingInfo.icon}</span>
                    <strong style={{ fontSize: '0.95rem', color: '#92400E' }}>
                      {rating} / 5 Stars — {activeRatingInfo.title}
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#B45309', display: 'block' }}>
                    {activeRatingInfo.subtitle}
                  </span>
                </div>
              </div>
            </Card>

            {/* 3. Guided Reflection Chips & Detailed Comment Box */}
            <Card variant="floating" style={{ padding: '2rem' }}>
              <CardHeader>
                <CardTitle style={{ fontSize: '1.15rem', color: '#1B4332' }}>Constructive Details & Feedback</CardTitle>
                <CardDescription>
                  Help the institution recognize great performance or identify resolution bottlenecks
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Quick Reflection Chips */}
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Quick Reflection Highlights (Click to add to your review):
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {STRUCTURED_REFLECTION_CHIPS.map((chip, idx) => {
                        const isSelected = selectedChips.includes(chip);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleToggleChip(chip)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '9999px',
                              border: isSelected ? '1px solid #2D6A4F' : '1px solid #E5E7EB',
                              backgroundColor: isSelected ? '#E8F5E9' : '#FFFFFF',
                              color: isSelected ? '#1B4332' : '#4B5563',
                              fontSize: '0.8rem',
                              fontWeight: isSelected ? 700 : 500,
                              cursor: 'pointer',
                              transition: 'all 120ms ease',
                            }}
                          >
                            {isSelected ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={12} /> {chip}
                              </span>
                            ) : (
                              chip
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div>
                    <Textarea
                      label="Detailed Comments & Suggestions (Optional)"
                      placeholder="Share your specific thoughts on how the issue was resolved, the officer's communication, or suggestions for preventive measures..."
                      rows={5}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      helperText={`${comment.length} / 1000 characters`}
                    />
                  </div>

                  {/* Submit Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      pill
                      isLoading={isSubmitting}
                      rightIcon={<Send size={16} />}
                    >
                      {isSubmitting ? 'Submitting Feedback...' : 'Submit Resolution Feedback'}
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>

          </form>
        )}

      </div>
    </StudentShell>
  );
};
