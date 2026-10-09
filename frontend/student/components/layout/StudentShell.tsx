'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  LayoutDashboard,
  Folder,
  Plus,
  Bell,
  Star,
  User,
  Menu,
  Landmark,
  Search,
  ChevronDown,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { Sidebar } from '../ui/Sidebar';
import { PageSpinner } from '../ui/LoadingState';
import { getDynamicAuthHeaders, getStoredUser, clearStoredUser } from '@lib/api';
import { useRealtimeNotifications } from '@lib/useRealtime';

// Authenticated Student Profile Interface
export interface StudentProfile {
  id: string;
  email: string;
  role: string;
  full_name: string;
  student_id: string;
  department_id?: string | null;
  phone?: string | null;
}

interface StudentShellContextType {
  user: StudentProfile | null;
  isLoading: boolean;
  unreadCount: number;
  refreshUnreadCount: () => void;
  logout: () => void;
  currentPath: string;
}

const StudentShellContext = createContext<StudentShellContextType | undefined>(undefined);

export const useStudentShell = () => {
  const context = useContext(StudentShellContext);
  if (!context) {
    throw new Error('useStudentShell must be used within a StudentShell');
  }
  return context;
};

export interface StudentShellProps {
  children: React.ReactNode;
  activePath?: string;
  requireAuth?: boolean;
}

const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: '00000000-0000-0000-0000-000000000006',
  email: 'student.alex@campus.edu',
  role: 'STUDENT',
  full_name: 'Alex Mercer',
  student_id: 'CS-2023-014',
  department_id: 'd1000000-0000-0000-0000-000000000001',
};

export const StudentShell: React.FC<StudentShellProps> = ({
  children,
  activePath = '/dashboard',
  requireAuth = true,
}) => {
  // Consistent initial state between SSR and client prevents hydration mismatch
  const [user, setUser] = useState<StudentProfile | null>(DEFAULT_STUDENT_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Fetch unread notification count dynamically from backend
  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: getDynamicAuthHeaders(),
      });
      const data = await res.json();
      const count =
        data.data?.unreadCount ??
        data.data?.unread_count ??
        data.meta?.unreadCount ??
        (Array.isArray(data.data?.notifications)
          ? data.data.notifications.filter((n: any) => !n.is_read).length
          : undefined);
      if (count !== undefined) {
        setUnreadCount(count);
      }
    } catch {
      // Non-blocking
    }
  }, []);

  // Fetch session user dynamically from real API /api/auth/me
  useEffect(() => {
    let isCancelled = false;

    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: getDynamicAuthHeaders(),
        });
        const data = await res.json();
        if (isCancelled) return;

        if (data.success && data.data?.user) {
          const u = data.data.user;
          const prof = u.profile;
          setUser({
            id: u.id,
            email: u.email,
            role: u.role,
            full_name: prof?.full_name || u.email?.split('@')[0] || 'Student',
            student_id: prof?.student_id || (u.id ? `STU-${u.id.slice(0, 6).toUpperCase()}` : ''),
            department_id: prof?.department_id,
            phone: prof?.phone,
          });
        } else if (requireAuth) {
          // Check if local stored user exists before redirecting
          const stored = getStoredUser();
          if (stored) {
            setUser({
              id: stored.id,
              email: stored.email || 'student.alex@campus.edu',
              role: stored.role || 'STUDENT',
              full_name: stored.name || 'Student',
              student_id: stored.studentId || `STU-${stored.id.slice(0, 6).toUpperCase()}`,
              department_id: stored.departmentId,
            });
          } else {
            window.location.href = '/login';
          }
        }
      } catch (err) {
        if (isCancelled) return;
        const stored = getStoredUser();
        if (stored) {
          setUser({
            id: stored.id,
            email: stored.email || 'student.alex@campus.edu',
            role: stored.role || 'STUDENT',
            full_name: stored.name || 'Student',
            student_id: stored.studentId || `STU-${stored.id.slice(0, 6).toUpperCase()}`,
            department_id: stored.departmentId,
          });
        } else if (requireAuth) {
          window.location.href = '/login';
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchSession();
    refreshUnreadCount();

    return () => {
      isCancelled = true;
    };
  }, [requireAuth, refreshUnreadCount]);

  // Subscribe to real-time notification WebSocket events
  useRealtimeNotifications(user?.id || '', () => {
    refreshUnreadCount();
  });

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    window.location.href = '/login';
  };

  const navigationItems = [
    { label: 'Dashboard', href: '/student/page', icon: <LayoutDashboard size={18} /> },
    { label: 'My Grievances', href: '/student/grievances', icon: <Folder size={18} /> },
    { label: 'Report Grievance', href: '/student/report', icon: <Plus size={18} />, isCta: true },
    { label: 'Notifications', href: '/student/notifications', icon: <Bell size={18} />, badge: unreadCount },
    { label: 'Feedback & Ratings', href: '/student/feedback', icon: <Star size={18} /> },
    { label: 'My Profile', href: '/student/page', icon: <User size={18} /> },
  ];

  return (
    <StudentShellContext.Provider
      value={{
        user,
        isLoading,
        unreadCount,
        refreshUnreadCount,
        logout: handleLogout,
        currentPath: activePath,
      }}
    >
      <div style={{ height: '100vh', backgroundColor: '#F8FAF8', color: '#111827', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header Bar */}
        <header
          style={{
            height: '64px',
            flexShrink: 0,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            position: 'sticky',
            top: 0,
            zIndex: 1030,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Left: Mobile Drawer Trigger + Institutional Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="sg-mobile-toggle"
              onClick={() => setIsMobileDrawerOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: '#374151',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Toggle navigation drawer"
            >
              <Menu size={22} />
            </button>

            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#1B4332',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(27, 67, 50, 0.2)',
                }}
              >
                <Landmark size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1B4332', letterSpacing: '-0.01em' }}>
                  AMIT Student Portal
                </span>
                <span style={{ fontSize: '0.65rem', display: 'block', color: '#2D6A4F', fontWeight: 600 }}>
                  Campus Grievance Portal
                </span>
              </div>
            </a>
          </div>

          {/* Center: Search / Quick Navigation Trigger (Desktop) */}
          <div style={{ alignItems: 'center' }} className="sg-desktop-search">
            <div
              onClick={() => (window.location.href = '/student/page')}
              style={{
                backgroundColor: '#F3F4F6',
                borderRadius: '9999px',
                padding: '0.45rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#6B7280',
                width: '260px',
                border: '1px solid #E5E7EB',
              }}
            >
              <Search size={15} />
              <span>Search grievances or ticket ID...</span>
            </div>
          </div>

          {/* Right: Primary CTA + Notifications + Profile Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Quick Report Grievance Action Button */}
            <Button
              variant="primary"
              size="sm"
              pill
              onClick={() => (window.location.href = '/student/report')}
              leftIcon={<Plus size={14} />}
              className="sg-header-cta"
            >
              Report Grievance
            </Button>

            {/* Notification Bell */}
            <button
              onClick={() => (window.location.href = '/student/notifications')}
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
              }}
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell size={18} color="#374151" />
              {unreadCount > 0 && (
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
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <Dropdown
              align="right"
              trigger={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#F4F9F6',
                    padding: '0.3rem 0.65rem 0.3rem 0.3rem',
                    borderRadius: '9999px',
                    border: '1px solid #D8F3DC',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#2D6A4F',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GraduationCap size={16} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1B4332' }}>
                    {user?.full_name || 'Student'}
                  </span>
                  <ChevronDown size={14} color="#6B7280" />
                </div>
              }
              items={[
                {
                  id: 'profile',
                  label: 'My Profile & ID',
                  icon: <User size={15} />,
                  onClick: () => (window.location.href = '/student/page'),
                },
                {
                  id: 'my-grievances',
                  label: 'My Grievances',
                  icon: <Folder size={15} />,
                  onClick: () => (window.location.href = '/student/page'),
                },
                {
                  id: 'notifications',
                  label: `Notifications (${unreadCount})`,
                  icon: <Bell size={15} />,
                  onClick: () => (window.location.href = '/student/page'),
                },
                {
                  id: 'logout',
                  label: 'Log Out',
                  icon: <LogOut size={15} />,
                  danger: true,
                  onClick: handleLogout,
                },
              ]}
            />
          </div>
        </header>

        {/* Main Body: Desktop Sidebar + Page Content Container */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          
          {/* Desktop Left Sidebar */}
          <aside
            className="sg-desktop-sidebar"
            style={{
              width: isSidebarCollapsed ? '72px' : '250px',
              height: '100%',
              overflowY: 'auto',
              flexShrink: 0,
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.25rem 0.75rem',
              transition: 'width 200ms ease',
              zIndex: 1010,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {navigationItems.map((item) => {
                const isActive = activePath === item.href;
                if (item.isCta) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      style={{
                        margin: '0.5rem 0',
                        padding: '0.65rem 1rem',
                        backgroundColor: '#2D6A4F',
                        color: '#FFFFFF',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                        gap: '0.6rem',
                        boxShadow: '0 4px 12px rgba(45, 106, 79, 0.2)',
                      }}
                    >
                      <span>{item.icon}</span>
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </a>
                  );
                }

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.875rem',
                      color: isActive ? '#1B4332' : '#4B5563',
                      backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                      borderLeft: isActive ? '3px solid #2D6A4F' : '3px solid transparent',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span>{item.icon}</span>
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span
                        style={{
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '9999px',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            {/* Sidebar Bottom Info Box */}
            {!isSidebarCollapsed && (
              <div style={{ backgroundColor: '#F0FDF4', padding: '0.85rem', borderRadius: '12px', border: '1px solid #DCFCE7' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1B4332', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <GraduationCap size={14} /> Active Student
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2D6A4F', marginTop: '0.15rem' }}>{user?.full_name}</div>
                <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>ID: {user?.student_id}</div>
              </div>
            )}
          </aside>

          {/* Main Content Area */}
          <main
            className="sg-main-content"
            style={{
              flex: 1,
              height: '100%',
              overflowY: 'auto',
              padding: '1.5rem',
              maxWidth: '1280px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            {children}
          </main>
        </div>

        {/* Mobile Navigation Drawer */}
        <Sidebar
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          activePath={activePath}
        />

        {/* Mobile Bottom Navigation Bar (Hidden on Desktop/Laptop via tokens.css) */}
        <nav
          className="sg-mobile-bottom-bar"
          aria-label="Student Mobile Navigation"
          style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E5E7EB',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0.5rem 0.25rem',
            zIndex: 1020,
            boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
          }}
        >
          <a href="/student/page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '0.7rem', color: '#1B4332', fontWeight: 700, textDecoration: 'none' }}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </a>
          <a href="/student/grievances" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '0.7rem', color: '#4B5563', textDecoration: 'none' }}>
            <Folder size={18} />
            <span>Complaints</span>
          </a>
          <a href="/student/report" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '0.75rem', color: '#FFFFFF', backgroundColor: '#2D6A4F', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontWeight: 700, textDecoration: 'none' }}>
            <Plus size={16} />
            <span>Report</span>
          </a>
          <a href="/student/notifications" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '0.7rem', color: '#4B5563', textDecoration: 'none' }}>
            <Bell size={18} />
            <span>Alerts</span>
          </a>
          <a href="/student/page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '0.7rem', color: '#4B5563', textDecoration: 'none' }}>
            <User size={18} />
            <span>Profile</span>
          </a>
        </nav>
      </div>
    </StudentShellContext.Provider>
  );
};
