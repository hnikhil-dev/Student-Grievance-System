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
  EmptyState,
  ErrorState,
  CardSkeleton,
  Alert,
} from '../index';
import { getDynamicAuthHeaders, getStoredUser } from '@lib/api';
import { useRealtimeNotifications } from '@lib/useRealtime';

export interface NotificationItem {
  id: string;
  user_id: string;
  grievance_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Visual mappings for canonical backend notification types
const NOTIFICATION_TYPE_CONFIG: Record<
  string,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  SUBMITTED: {
    label: 'Grievance Registered',
    icon: '📥',
    bg: '#F0F9FF',
    text: '#0369A1',
    border: '#BAE6FD',
  },
  ASSIGNED: {
    label: 'Officer Assigned',
    icon: '👤',
    bg: '#F5F3FF',
    text: '#6D28D9',
    border: '#DDD6FE',
  },
  STATUS_UPDATE: {
    label: 'Status Changed',
    icon: '🔄',
    bg: '#EFF6FF',
    text: '#1D4ED8',
    border: '#BFDBFE',
  },
  COMMENT_ADDED: {
    label: 'New Message',
    icon: '💬',
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
  },
  SLA_WARNING: {
    label: 'SLA Warning',
    icon: '⚠️',
    bg: '#FFFBEB',
    text: '#B45309',
    border: '#FDE68A',
  },
  SLA_BREACH: {
    label: 'SLA Breached',
    icon: '🚨',
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FCA5A5',
  },
  RESOLUTION_PROPOSED: {
    label: 'Resolution Proposed',
    icon: '💡',
    bg: '#FEFCE8',
    text: '#92400E',
    border: '#FEF08A',
  },
  VERIFICATION_REQUIRED: {
    label: 'Verification Required',
    icon: '⏳',
    bg: '#FEFCE8',
    text: '#92400E',
    border: '#FEF08A',
  },
  REOPENED: {
    label: 'Grievance Reopened',
    icon: '🔁',
    bg: '#FFF1F2',
    text: '#BE123C',
    border: '#FECDD3',
  },
  CLOSED: {
    label: 'Resolution Accepted',
    icon: '✅',
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
  },
  ESCALATED: {
    label: 'Grievance Escalated',
    icon: '🔺',
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FCA5A5',
  },
};

export const NotificationsCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD' | 'ACTION'>('ALL');
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Dynamic active user session
  const [activeUser, setActiveUser] = useState(() => getStoredUser());

  useEffect(() => {
    setActiveUser(getStoredUser());
  }, []);

  // Load Notifications from Real API: GET /api/notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/notifications', {
        headers: getDynamicAuthHeaders(),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const list = Array.isArray(json.data.notifications)
          ? json.data.notifications
          : Array.isArray(json.data)
          ? json.data
          : [];
        setNotifications(list);
      } else {
        setErrorMessage(json.error?.message || 'Failed to retrieve notifications from server.');
      }
    } catch {
      setErrorMessage('Network connection error while retrieving notifications.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime Supabase notifications for the active student
  useRealtimeNotifications(activeUser?.id, () => {
    fetchNotifications();
  });

  // Mark single notification as read: POST /api/notifications/[id]/read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );

      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: getDynamicAuthHeaders(),
      });
    } catch {
      // Revert if failed
      await fetchNotifications();
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    const unreadList = notifications.filter((n) => !n.is_read);
    if (unreadList.length === 0) return;

    setIsMarkingAll(true);
    setActionNotice(null);

    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      // Execute backend mark-as-read calls concurrently
      await Promise.allSettled(
        unreadList.map((n) =>
          fetch(`/api/notifications/${n.id}/read`, {
            method: 'POST',
            headers: getDynamicAuthHeaders(),
          })
        )
      );

      setActionNotice('All notifications have been marked as read.');
    } catch {
      setActionNotice('Some notifications could not be updated.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Navigate to related grievance
  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.is_read) {
      await handleMarkAsRead(n.id);
    }
    if (n.grievance_id) {
      window.location.href = `/student/grievances/${n.grievance_id}`;
    }
  };

  // Filtered notifications list
  const filteredNotifications = useMemo(() => {
    if (filterTab === 'UNREAD') {
      return notifications.filter((n) => !n.is_read);
    }
    if (filterTab === 'ACTION') {
      return notifications.filter((n) =>
        [
          'RESOLUTION_PROPOSED',
          'VERIFICATION_REQUIRED',
          'SLA_WARNING',
          'SLA_BREACH',
          'REOPENED',
          'ESCALATED',
        ].includes(n.type)
      );
    }
    return notifications;
  }, [notifications, filterTab]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  // Format relative timestamp
  const formatTimeAgo = (isoString: string) => {
    try {
      const now = Date.now();
      const past = new Date(isoString).getTime();
      const diffSec = Math.floor((now - past) / 1000);

      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;

      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <StudentShell activePath="/student/notifications">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '880px', margin: '0 auto' }}>
        
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🔔</span>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                  fontWeight: 800,
                  color: '#1B4332',
                  letterSpacing: '-0.02em',
                }}
              >
                Notification Center
              </h1>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.6rem',
                    borderRadius: '9999px',
                    boxShadow: '0 1px 3px rgba(220, 38, 38, 0.3)',
                  }}
                >
                  {unreadCount} New
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.5 }}>
              Live updates, officer replies, resolution verification notices, and automated SLA alerts.
            </p>
          </div>

          {/* Action: Mark All as Read */}
          {unreadCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outline"
                size="sm"
                pill
                isLoading={isMarkingAll}
                onClick={handleMarkAllAsRead}
                leftIcon="✓"
              >
                Mark All as Read
              </Button>
            </div>
          )}
        </div>

        {/* Global Feedback Alert */}
        {actionNotice && (
          <Alert type="success" onClose={() => setActionNotice(null)}>
            {actionNotice}
          </Alert>
        )}

        {/* =========================================================================
            FILTER TABS BAR
           ========================================================================= */}
        <div
          role="tablist"
          aria-label="Notification filter tabs"
          style={{
            display: 'flex',
            gap: '0.5rem',
            backgroundColor: '#FFFFFF',
            padding: '0.35rem',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            width: 'fit-content',
            maxWidth: '100%',
            flexWrap: 'wrap',
          }}
        >
          {[
            { id: 'ALL', label: `All Alerts (${notifications.length})` },
            { id: 'UNREAD', label: `Unread (${unreadCount})` },
            { id: 'ACTION', label: 'Action Required ⚡' },
          ].map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id as any)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? '#1B4332' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            NOTIFICATION LIST
           ========================================================================= */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : errorMessage ? (
          <ErrorState
            title="Unable to Load Notifications"
            message={errorMessage}
            onRetry={fetchNotifications}
          />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title={filterTab === 'UNREAD' ? 'No Unread Notifications' : 'No New Notifications'}
            description={
              filterTab === 'UNREAD'
                ? "You've read all your notifications! Check back whenever a complaint status changes."
                : "You're completely up to date. You will receive real-time notifications here as your grievances progress."
            }
            actionLabel={filterTab === 'UNREAD' ? 'Show All Notifications' : 'Report a Grievance'}
            onAction={
              filterTab === 'UNREAD'
                ? () => setFilterTab('ALL')
                : () => (window.location.href = '/student/report')
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredNotifications.map((n) => {
              const cfg = NOTIFICATION_TYPE_CONFIG[n.type] || {
                label: 'General Alert',
                icon: '📌',
                bg: '#F3F4F6',
                text: '#374151',
                border: '#E5E7EB',
              };

              const isActionRequired = [
                'RESOLUTION_PROPOSED',
                'VERIFICATION_REQUIRED',
                'SLA_WARNING',
                'SLA_BREACH',
              ].includes(n.type);

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    backgroundColor: n.is_read ? '#FFFFFF' : '#F9FBFA',
                    borderRadius: '16px',
                    border: !n.is_read
                      ? '1px solid #52B788'
                      : isActionRequired
                      ? '1px solid #FCD34D'
                      : '1px solid #E5E7EB',
                    boxShadow: !n.is_read
                      ? '0 4px 12px rgba(45, 106, 79, 0.06)'
                      : '0 1px 3px rgba(0,0,0,0.02)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    cursor: n.grievance_id ? 'pointer' : 'default',
                    transition: 'all 150ms ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (n.grievance_id) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (n.grievance_id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = !n.is_read
                        ? '0 4px 12px rgba(45, 106, 79, 0.06)'
                        : '0 1px 3px rgba(0,0,0,0.02)';
                    }
                  }}
                >
                  {/* Left Icon Pill */}
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      flexShrink: 0,
                    }}
                  >
                    {cfg.icon}
                  </div>

                  {/* Body Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            backgroundColor: cfg.bg,
                            color: cfg.text,
                            border: `1px solid ${cfg.border}`,
                          }}
                        >
                          {cfg.label}
                        </span>

                        {!n.is_read && (
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#2D6A4F',
                              display: 'inline-block',
                            }}
                          />
                        )}
                      </div>

                      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>
                        {formatTimeAgo(n.created_at)}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: '0 0 0.35rem 0',
                        fontSize: '0.95rem',
                        fontWeight: n.is_read ? 600 : 700,
                        color: '#111827',
                        lineHeight: 1.4,
                      }}
                    >
                      {n.title}
                    </h4>

                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.5 }}>
                      {n.message}
                    </p>

                    {/* Footer Actions: Related Ticket & Mark as Read */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {n.grievance_id ? (
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#2D6A4F',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <span>↗</span>
                          <span>Open Ticket Details</span>
                        </span>
                      ) : (
                        <div />
                      )}

                      {!n.is_read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6B7280',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#111827';
                            e.currentTarget.style.backgroundColor = '#F3F4F6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#6B7280';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </StudentShell>
  );
};
