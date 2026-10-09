'use client';

import React, { useEffect } from 'react';
import {
  X,
  Landmark,
  LayoutDashboard,
  Sparkles,
  Folder,
  Bell,
  Star,
} from 'lucide-react';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePath?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activePath = '/student/page',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    { label: 'Campus Portal Home', href: '/', icon: <Landmark size={18} /> },
    { label: 'Student Dashboard', href: '/student/page', icon: <LayoutDashboard size={18} /> },
    { label: 'Report Grievance (AI)', href: '/student/report', icon: <Sparkles size={18} /> },
    { label: 'My Grievances', href: '/student/grievances', icon: <Folder size={18} /> },
    { label: 'Notifications', href: '/student/notifications', icon: <Bell size={18} /> },
    { label: 'Feedback & Ratings', href: '/student/feedback', icon: <Star size={18} /> },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Student Navigation Drawer"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1040,
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '280px',
          maxWidth: '85vw',
          backgroundColor: '#FFFFFF',
          height: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 1.25rem',
          animation: 'sg-slide-right 200ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ fontWeight: 800, color: '#1B4332', fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
              AMIT Student Portal
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#2D6A4F', fontWeight: 600 }}>
              Smart Grievance 2026
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation drawer"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#6B7280',
              padding: '0.35rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Mobile Navigation" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const isActive = activePath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                  color: isActive ? '#1B4332' : '#374151',
                  borderLeft: isActive ? '3px solid #2D6A4F' : '3px solid transparent',
                  minHeight: '44px',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <style jsx global>{`
        @keyframes sg-slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
