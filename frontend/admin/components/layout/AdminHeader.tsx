import React, { useState, useRef, useEffect } from 'react';
import { colors, typography, radii, shadows, transitions } from '../../tokens';
import { Menu, Bell, Search, CheckCircle2, AlertTriangle, Clock, X, Shield } from '../ui/Icons';

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
  onOpenMobileMenu?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  notificationCount?: number;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'alert' | 'info' | 'success';
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Critical SLA Risk: Lab 3 Burnout',
    desc: 'Ticket GRV-2026-00001 exceeded 80% resolution buffer.',
    time: '4m ago',
    type: 'alert',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Cluster Aggregated: Mess Food Quality',
    desc: '14 recurring complaints clustered across Hostel B.',
    time: '18m ago',
    type: 'info',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'AI Classification Dispatched',
    desc: '28 newly submitted student grievances auto-tagged & routed.',
    time: '35m ago',
    type: 'success',
    read: false,
  },
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  onOpenMobileMenu,
  searchValue = '',
  onSearchChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: colors.cardSurface,
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: shadows.subtle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        fontFamily: typography.fontFamily,
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxSizing: 'border-box',
      }}
    >
      {/* Left: Mobile Drawer Button + Breadcrumbs + Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {onOpenMobileMenu && (
          <button
            type="button"
            className="admin-mobile-toggle"
            onClick={onOpenMobileMenu}
            aria-label="Toggle navigation menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.lightBotanical,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              padding: '0.45rem',
              color: colors.primaryGreen,
              cursor: 'pointer',
              transition: `all ${transitions.fast}`,
            }}
          >
            <Menu size={18} />
          </button>
        )}

        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: typography.fontSize.xs,
                color: colors.secondaryText,
                marginBottom: '0.1rem',
              }}
            >
              <span>Admin</span>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <span style={{ opacity: 0.5 }}>/</span>
                  <span
                    style={{
                      color: idx === breadcrumbs.length - 1 ? colors.primaryGreen : colors.secondaryText,
                      fontWeight: idx === breadcrumbs.length - 1 ? typography.fontWeight.semibold : 'normal',
                    }}
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}

          <h1
            style={{
              margin: 0,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
              color: colors.deepForestGreen,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Live Sentinel Pill + Dynamic Search + Notifications + Officer Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Realtime Live Sentinel Status Pill */}
        <div
          className="admin-header-sentinel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.65rem',
            backgroundColor: colors.lightBotanical,
            borderRadius: radii.full,
            border: `1px solid ${colors.border}`,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.medium,
            color: colors.deepForestGreen,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: radii.full,
              backgroundColor: '#10B981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)',
              display: 'inline-block',
            }}
          />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Shield size={12} color={colors.primaryGreen} />
            Sentinel Active
          </span>
        </div>

        {/* Global Search Bar */}
        <div
          className="admin-header-search"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: colors.secondaryText,
            }}
          >
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search records or modules..."
            style={{
              paddingLeft: '2.1rem',
              paddingRight: searchValue ? '2rem' : '0.75rem',
              paddingTop: '0.4rem',
              paddingBottom: '0.4rem',
              fontSize: typography.fontSize.xs,
              fontFamily: typography.fontFamily,
              backgroundColor: colors.adminBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              color: colors.primaryText,
              outline: 'none',
              width: '180px',
              transition: `width ${transitions.default}, border-color ${transitions.fast}`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primaryGreen;
              e.currentTarget.style.width = '240px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              if (!searchValue) e.currentTarget.style.width = '180px';
            }}
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '0.5rem',
                background: 'none',
                border: 'none',
                color: colors.secondaryText,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.15rem',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="View notifications"
            style={{
              position: 'relative',
              backgroundColor: isNotifOpen ? colors.lightBotanical : colors.adminBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: colors.deepForestGreen,
              transition: `all ${transitions.fast}`,
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '17px',
                  height: '17px',
                  padding: '0 3px',
                  borderRadius: radii.full,
                  backgroundColor: colors.danger,
                  color: '#FFFFFF',
                  fontSize: '0.62rem',
                  fontWeight: typography.fontWeight.bold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                  boxSizing: 'border-box',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dynamic Notification Dropdown */}
          {isNotifOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                backgroundColor: colors.cardSurface,
                borderRadius: radii.lg,
                boxShadow: shadows.dropdown,
                border: `1px solid ${colors.border}`,
                zIndex: 100,
                overflow: 'hidden',
                animation: 'fadeDown 0.15s ease-out',
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: colors.lightBotanical,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bell size={15} color={colors.primaryGreen} />
                  <span
                    style={{
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.deepForestGreen,
                    }}
                  >
                    System Alerts ({unreadCount} new)
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.primaryGreen,
                      fontSize: '0.7rem',
                      fontWeight: typography.fontWeight.semibold,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      color: colors.secondaryText,
                      fontSize: typography.fontSize.xs,
                    }}
                  >
                    No active notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: `1px solid ${colors.border}`,
                        backgroundColor: notif.read ? 'transparent' : 'rgba(230, 243, 238, 0.45)',
                        position: 'relative',
                        display: 'flex',
                        gap: '0.65rem',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ marginTop: '0.15rem', flexShrink: 0 }}>
                        {notif.type === 'alert' && <AlertTriangle size={15} color={colors.danger} />}
                        {notif.type === 'info' && <Clock size={15} color={colors.warning} />}
                        {notif.type === 'success' && <CheckCircle2 size={15} color={colors.primaryGreen} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: notif.read ? typography.fontWeight.medium : typography.fontWeight.bold,
                            color: colors.primaryText,
                            marginBottom: '0.15rem',
                          }}
                        >
                          {notif.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: colors.secondaryText,
                            lineHeight: 1.35,
                            marginBottom: '0.25rem',
                          }}
                        >
                          {notif.desc}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: colors.secondaryText }}>
                          {notif.time}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDismissNotification(notif.id)}
                        aria-label="Dismiss alert"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.secondaryText,
                          cursor: 'pointer',
                          padding: '0.15rem',
                          opacity: 0.6,
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Officer Profile Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingLeft: '0.5rem',
            borderLeft: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: radii.full,
              backgroundColor: colors.primaryGreen,
              color: '#FFFFFF',
              fontWeight: typography.fontWeight.bold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: typography.fontSize.xs,
            }}
          >
            AD
          </div>
          <div style={{ display: 'none' }}>
            <div style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold }}>Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
