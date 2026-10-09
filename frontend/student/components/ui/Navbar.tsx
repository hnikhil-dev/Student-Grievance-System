'use client';

import React, { useState } from 'react';
import { Landmark, Bell, GraduationCap } from 'lucide-react';

export interface NavbarProps {
  studentName?: string;
  studentId?: string;
  unreadNotificationsCount?: number;
  onNotificationClick?: () => void;
  activePath?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  studentName = 'Student',
  studentId = '',
  unreadNotificationsCount = 0,
  onNotificationClick,
  activePath = '/dashboard',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Landing', href: '/' },
    { label: 'Dashboard', href: '/student/page' },
    { label: '+ File Complaint', href: '/student/report', highlight: true },
    { label: 'My Grievances', href: '/student/grievances' },
  ];

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 1020,
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        {/* Brand & Emblem grounded in Reference Design */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#1B4332',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: '0 4px 10px rgba(27, 67, 50, 0.25)',
              border: '2px solid #2D6A4F',
              flexShrink: 0,
            }}
          >
            <Landmark size={22} />
          </div>
          <div>
            <div className="sg-nav-institution" style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1B4332', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              ATMA MALIK INSTITUTE
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2D6A4F', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Student Grievance</span>
              <span style={{ fontSize: '0.625rem', backgroundColor: '#E8F5E9', color: '#1B4332', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid #D8F3DC' }}>
                2026 AI
              </span>
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav style={{ alignItems: 'center', gap: '1.25rem' }} className="sg-desktop-nav">
          {navItems.map((item) => {
            const isActive = activePath === item.href;
            if (item.highlight) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    backgroundColor: '#2D6A4F',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.1rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(45, 106, 79, 0.25)',
                    transition: 'all 150ms ease',
                  }}
                >
                  {item.label}
                </a>
              );
            }
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  color: isActive ? '#1B4332' : '#4B5563',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9375rem',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid #2D6A4F' : '2px solid transparent',
                  padding: '0.4rem 0.2rem',
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right Section: Notification Bell & Student Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Notification Trigger Button */}
          <button
            type="button"
            onClick={onNotificationClick || (() => (window.location.href = '/student/notifications'))}
            aria-label="View alerts and notifications"
            style={{
              position: 'relative',
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Notifications"
          >
            <Bell size={18} color="#374151" />
            {unreadNotificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                }}
              >
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Student Profile Pill */}
          <a
            href="/student/page"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#F4F9F6',
              padding: '0.25rem 0.65rem 0.25rem 0.25rem',
              borderRadius: '9999px',
              border: '1px solid #D8F3DC',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <GraduationCap size={16} />
            </div>
            <span style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#1B4332', whiteSpace: 'nowrap' }}>
              {studentName.split(' ')[0]}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
};
