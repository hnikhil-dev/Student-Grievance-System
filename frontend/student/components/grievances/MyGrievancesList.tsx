'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StudentShell,
  Button,
  Input,
  Select,
  Card,
  StatusBadge,
  PriorityBadge,
  SlaIndicator,
  DynamicSlaBar,
  EmptyState,
  ErrorState,
  CardSkeleton,
  Alert,
} from '../index';
import { useRealtimeGrievances } from '@lib/useRealtime';
import { getDynamicAuthHeaders } from '@lib/api';
import { GrievanceStatusType, PriorityLevel } from '../../types/design-system';

interface GrievanceItem {
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
  sla_status?: {
    slaHours: number;
    dueAt: string;
    isOverdue: boolean;
    isWarning: boolean;
    remainingMinutes: number;
    elapsedPercent: number;
  };
}

interface MetaPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const MyGrievancesList: React.FC = () => {
  // Data States
  const [grievances, setGrievances] = useState<GrievanceItem[]>([]);
  const [meta, setMeta] = useState<MetaPagination>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Control & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'LATEST' | 'OLDEST' | 'PRIORITY_DESC' | 'SLA_URGENT'>('LATEST');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Debounce search input to minimize network requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Grievances from Real API: GET /api/grievances/my
  const fetchGrievances = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('pageSize', '15');

      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }
      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }
      if (priorityFilter !== 'ALL') {
        params.set('priority', priorityFilter);
      }

      const res = await fetch(`/api/grievances/my?${params.toString()}`, {
        headers: getDynamicAuthHeaders(),
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setGrievances(json.data);
        if (json.meta) {
          setMeta({
            page: json.meta.page || 1,
            pageSize: json.meta.pageSize || 15,
            totalCount: json.meta.totalCount || json.data.length,
            totalPages: json.meta.totalPages || 1,
          });
        }
      } else {
        setErrorMessage(json.error?.message || 'Failed to retrieve grievances from the server.');
      }
    } catch {
      setErrorMessage('Network connection error. Unable to communicate with the grievance service.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  // Realtime Supabase updates: auto-fetch on changes
  useRealtimeGrievances(() => {
    fetchGrievances();
  });

  // Apply Client-Side Category Filtering and Sorting
  const processedGrievances = useMemo(() => {
    let result = [...grievances];

    // Category Filter
    if (categoryFilter !== 'ALL') {
      result = result.filter(
        (g) => g.category?.toUpperCase() === categoryFilter.toUpperCase()
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'OLDEST') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'PRIORITY_DESC') {
        return (b.priority_score || 0) - (a.priority_score || 0);
      }
      if (sortBy === 'SLA_URGENT') {
        const remainingA = a.sla_status?.remainingMinutes ?? 999999;
        const remainingB = b.sla_status?.remainingMinutes ?? 999999;
        return remainingA - remainingB;
      }
      // Default: LATEST
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [grievances, categoryFilter, sortBy]);

  // Quick Metrics for Header Summary Bar
  const summaryCounts = useMemo(() => {
    const total = meta.totalCount || grievances.length;
    const open = grievances.filter((g) =>
      ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'].includes(g.status)
    ).length;
    const awaitingVerification = grievances.filter((g) =>
      ['STUDENT_VERIFICATION', 'RESOLUTION_PROPOSED'].includes(g.status)
    ).length;
    const resolved = grievances.filter((g) =>
      ['RESOLVED', 'CLOSED'].includes(g.status)
    ).length;

    return { total, open, awaitingVerification, resolved };
  }, [grievances, meta.totalCount]);

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    sortBy !== 'LATEST';

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
    setSortBy('LATEST');
    setCurrentPage(1);
  };

  // Helper date formatter
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

  return (
    <StudentShell activePath="/student/grievances">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* =========================================================================
            HEADER & ACTIONS
           ========================================================================= */}
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
              <span style={{ fontSize: '1.75rem' }}>📂</span>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                  fontWeight: 800,
                  color: '#1B4332',
                  letterSpacing: '-0.02em',
                }}
              >
                My Grievances
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: '#4B5563', maxWidth: '650px', lineHeight: 1.5 }}>
              Monitor, filter, and track real-time resolution progress and institutional SLAs for all your submitted campus complaints.
            </p>
          </div>

          {/* Primary Action Button */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Button
              variant="primary"
              size="md"
              pill
              onClick={() => (window.location.href = '/student/report')}
              leftIcon="➕"
              rightIcon="→"
            >
              Report a Grievance
            </Button>
          </div>
        </div>

        {/* =========================================================================
            QUICK STATUS SUMMARY BAR
           ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <div
            onClick={() => setStatusFilter('ALL')}
            style={{
              backgroundColor: '#FFFFFF',
              padding: '0.85rem 1.15rem',
              borderRadius: '16px',
              border: statusFilter === 'ALL' ? '2px solid #2D6A4F' : '1px solid #E5E7EB',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 150ms ease',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                All Complaints
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B4332' }}>
                {summaryCounts.total}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>📋</span>
          </div>

          <div
            onClick={() => setStatusFilter('IN_PROGRESS')}
            style={{
              backgroundColor: '#FFFFFF',
              padding: '0.85rem 1.15rem',
              borderRadius: '16px',
              border: statusFilter === 'IN_PROGRESS' ? '2px solid #2563EB' : '1px solid #E5E7EB',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 150ms ease',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 600, textTransform: 'uppercase' }}>
                Under Resolution
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1D4ED8' }}>
                {summaryCounts.open}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>⚙️</span>
          </div>

          <div
            onClick={() => setStatusFilter('STUDENT_VERIFICATION')}
            style={{
              backgroundColor: summaryCounts.awaitingVerification > 0 ? '#FEFCE8' : '#FFFFFF',
              padding: '0.85rem 1.15rem',
              borderRadius: '16px',
              border: statusFilter === 'STUDENT_VERIFICATION' ? '2px solid #D97706' : '1px solid #FEF08A',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 150ms ease',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>
                Needs Your Review
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B45309' }}>
                {summaryCounts.awaitingVerification}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
          </div>

          <div
            onClick={() => setStatusFilter('CLOSED')}
            style={{
              backgroundColor: '#FFFFFF',
              padding: '0.85rem 1.15rem',
              borderRadius: '16px',
              border: statusFilter === 'CLOSED' ? '2px solid #059669' : '1px solid #E5E7EB',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 150ms ease',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 600, textTransform: 'uppercase' }}>
                Resolved & Closed
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857' }}>
                {summaryCounts.resolved}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>✅</span>
          </div>
        </div>

        {/* =========================================================================
            FILTER CONTROLS BAR
           ========================================================================= */}
        <Card variant="default" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Top Row: Search & Reset */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px' }}>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticket number, title, or keywords..."
                  leftIcon="🔍"
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  leftIcon="✕"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Bottom Row: Filter Dropdowns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              {/* Status Filter */}
              <div>
                <Select
                  label="Status Filter"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 'ALL', label: 'All Statuses' },
                    { value: 'SUBMITTED', label: '📥 Submitted' },
                    { value: 'UNDER_REVIEW', label: '🔍 Under Review' },
                    { value: 'ASSIGNED', label: '👤 Assigned' },
                    { value: 'IN_PROGRESS', label: '⚙️ In Progress' },
                    { value: 'RESOLUTION_PROPOSED', label: '💡 Resolution Proposed' },
                    { value: 'STUDENT_VERIFICATION', label: '⏳ Awaiting Verification' },
                    { value: 'RESOLVED', label: '✅ Resolved' },
                    { value: 'REOPENED', label: '🔄 Reopened' },
                    { value: 'CLOSED', label: '✔ Closed' },
                  ]}
                />
              </div>

              {/* Priority Filter */}
              <div>
                <Select
                  label="Priority Filter"
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 'ALL', label: 'All Priorities' },
                    { value: 'CRITICAL', label: '🚨 Critical Priority' },
                    { value: 'HIGH', label: '🔥 High Priority' },
                    { value: 'MEDIUM', label: '⚡ Medium Priority' },
                    { value: 'LOW', label: '🟢 Low Priority' },
                  ]}
                />
              </div>

              {/* Category Filter */}
              <div>
                <Select
                  label="Category Filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Categories' },
                    { value: 'IT', label: '💻 IT & Infrastructure' },
                    { value: 'ACADEMICS', label: '📚 Academic Affairs' },
                    { value: 'HOSTEL', label: '🏠 Hostel & Housing' },
                    { value: 'MAINTENANCE', label: '🔧 Campus Maintenance' },
                    { value: 'TRANSPORT', label: '🚌 Shuttle & Transport' },
                    { value: 'CANTEEN', label: '🍲 Canteen & Food' },
                    { value: 'LIBRARY', label: '📖 Library' },
                    { value: 'STUDENT_AFFAIRS', label: '🤝 Student Affairs' },
                  ]}
                />
              </div>

              {/* Sort By Filter */}
              <div>
                <Select
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  options={[
                    { value: 'LATEST', label: '🕒 Latest Created' },
                    { value: 'OLDEST', label: '📅 Oldest Created' },
                    { value: 'PRIORITY_DESC', label: '⚡ Highest Priority' },
                    { value: 'SLA_URGENT', label: '⏱ Most Urgent SLA' },
                  ]}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* =========================================================================
            GRIEVANCE CARD LIST STREAM
           ========================================================================= */}
        {isLoading ? (
          /* Skeleton Loading Cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : errorMessage ? (
          /* Error State with Recovery Action */
          <ErrorState
            title="Failed to Load Grievances"
            message={errorMessage}
            onRetry={fetchGrievances}
          />
        ) : processedGrievances.length === 0 ? (
          hasActiveFilters ? (
            /* Empty Filter Results */
            <EmptyState
              variant="search"
              onAction={handleResetFilters}
            />
          ) : (
            /* Empty Grievance Inbox State */
            <EmptyState
              variant="grievances"
              onAction={() => (window.location.href = '/student/report')}
            />
          )
        ) : (
          /* Grievance Cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {processedGrievances.map((g) => {
              const isVerificationPending =
                g.status === 'STUDENT_VERIFICATION' || g.status === 'RESOLUTION_PROPOSED';
              const isBreached = g.sla_status?.isOverdue;
              const isWarning = g.sla_status?.isWarning;

              return (
                <div
                  key={g.id}
                  className="sg-animate-slide-up sg-action-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: isVerificationPending
                      ? '2px solid #F59E0B'
                      : isBreached
                      ? '2px solid #EF4444'
                      : isWarning
                      ? '2px solid #FCD34D'
                      : '1px solid #E5E7EB',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    padding: '1.35rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'all 180ms ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  }}
                >
                  {/* Action Banner for Verification */}
                  {isVerificationPending && (
                    <div
                      style={{
                        margin: '-1.35rem -1.5rem 0.5rem -1.5rem',
                        padding: '0.45rem 1.5rem',
                        backgroundColor: '#FEF3C7',
                        borderBottom: '1px solid #FDE68A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#92400E',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>⚡</span>
                        <span>RESOLUTION PROPOSED: Department has marked this resolved. Please verify.</span>
                      </div>
                      <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                        Verify Now →
                      </span>
                    </div>
                  )}

                  {/* Card Header Row: Ticket ID, Badges, SLA */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 800,
                          color: '#1B4332',
                          fontFamily: 'monospace',
                          backgroundColor: '#E8F5E9',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '8px',
                          border: '1px solid #D8F3DC',
                        }}
                      >
                        {g.ticket_number}
                      </span>

                      <StatusBadge status={g.status} size="sm" />
                      <PriorityBadge priority={g.priority} score={g.priority_score} size="sm" />

                      {isVerificationPending ? (
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

                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#F3F4F6',
                          color: '#374151',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                        }}
                      >
                        📂 {g.category}
                      </span>

                      {g.is_confidential && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: '#FEF2F2',
                            color: '#991B1B',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                          }}
                        >
                          🔒 Confidential
                        </span>
                      )}

                      {g.is_anonymous && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            backgroundColor: '#F3F4F6',
                            color: '#4B5563',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                          }}
                        >
                          👤 Anonymous
                        </span>
                      )}
                    </div>

                    {/* SLA Countdown Badge */}
                    <div>
                      <SlaIndicator slaStatus={g.sla_status} size="sm" />
                    </div>
                  </div>

                  {/* Card Main: Title & Description Preview */}
                  <div>
                    <h3
                      style={{
                        margin: '0 0 0.35rem 0',
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        color: '#111827',
                        lineHeight: 1.4,
                      }}
                    >
                      {g.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#4B5563',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {g.description}
                    </p>
                  </div>

                  {/* Dynamic SLA Countdown Bar */}
                  <DynamicSlaBar slaStatus={g.sla_status} compact={true} />

                  {/* Card Footer: Metadata (Department, Dates, Details Action) */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #F3F4F6',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#6B7280' }}>
                      {/* Department */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: '#1B4332' }}>
                        <span>🏛️</span>
                        <span>{g.department ? `${g.department.name} (${g.department.code})` : 'Unassigned'}</span>
                      </span>

                      {/* Location */}
                      {g.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span>📍</span>
                          <span>{g.location}</span>
                        </span>
                      )}

                      {/* Created Date */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>📅</span>
                        <span>Created: {formatDate(g.created_at)}</span>
                      </span>

                      {/* Last Updated */}
                      {g.updated_at && g.updated_at !== g.created_at && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span>🔄</span>
                          <span>Updated: {formatDate(g.updated_at)}</span>
                        </span>
                      )}
                    </div>

                    {/* View Details Action */}
                    <Button
                      variant={isVerificationPending ? 'primary' : 'outline'}
                      size="sm"
                      pill
                      onClick={() => (window.location.href = `/student/grievances/${g.id}`)}
                      rightIcon="→"
                    >
                      {isVerificationPending ? 'Review & Verify' : 'View Details'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            PAGINATION CONTROLS
           ========================================================================= */}
        {meta.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '1rem',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              Showing Page {meta.page} of {meta.totalPages} ({meta.totalCount} total grievances)
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="outline"
                size="sm"
                pill
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                pill
                disabled={currentPage >= meta.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        )}

      </div>
    </StudentShell>
  );
};
