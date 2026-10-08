import React, { useState } from 'react';
import { AdminRouteId, NavSection } from '../../types/navigation';
import { colors, typography, radii, transitions } from '../../tokens';
import {
  LayoutDashboard,
  Building2,
  Tag,
  Zap,
  Copy,
  Network,
  Clock,
  AlertTriangle,
  BarChart3,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Leaf,
} from '../ui/Icons';

export interface AdminSidebarProps {
  activeRoute: AdminRouteId;
  onRouteChange: (route: AdminRouteId) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'ADMIN',
    items: [
      {
        id: 'command-center',
        label: 'Command Center',
        href: '/admin/command-center',
        icon: <LayoutDashboard size={18} />,
        description: 'Executive triage and operational overview',
        phase: 1,
      },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      {
        id: 'departments',
        label: 'Departments',
        href: '/admin/departments',
        icon: <Building2 size={18} />,
        description: 'Departmental queues and workload allocation',
        phase: 2,
      },
    ],
  },
  {
    title: 'AI OPERATIONS',
    items: [
      {
        id: 'classification',
        label: 'AI Classification',
        href: '/admin/classification',
        icon: <Tag size={18} />,
        badge: 'AI',
        description: 'Autonomous symptom tagging and routing',
        phase: 3,
      },
      {
        id: 'priority',
        label: 'Priority Engine',
        href: '/admin/priority',
        icon: <Zap size={18} />,
        badge: 'AI',
        description: 'Multi-factor severity and urgency matrix',
        phase: 4,
      },
      {
        id: 'duplicates',
        label: 'Duplicate Detection',
        href: '/admin/duplicates',
        icon: <Copy size={18} />,
        badge: 'AI',
        description: 'Semantic vector similarity deduplication',
        phase: 5,
      },
      {
        id: 'clusters',
        label: 'Clustering',
        href: '/admin/clusters',
        icon: <Network size={18} />,
        badge: 'AI',
        description: 'Issue aggregation and systemic trend analysis',
        phase: 6,
      },
    ],
  },
  {
    title: 'SERVICE MANAGEMENT',
    items: [
      {
        id: 'sla',
        label: 'SLA Monitoring',
        href: '/admin/sla',
        icon: <Clock size={18} />,
        description: 'Resolution countdown and threshold radar',
        phase: 7,
      },
      {
        id: 'escalation',
        label: 'Escalation',
        href: '/admin/escalation',
        icon: <AlertTriangle size={18} />,
        description: 'Hierarchical officer intervention dispatch',
        phase: 8,
      },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/admin/analytics',
        icon: <BarChart3 size={18} />,
        description: 'Institutional compliance and trends',
        phase: 9,
      },
      {
        id: 'insights',
        label: 'AI Insights',
        href: '/admin/insights',
        icon: <Sparkles size={18} />,
        badge: 'AI',
        description: 'Predictive root-cause recommendations',
        phase: 10,
      },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeRoute,
  onRouteChange,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20, 67, 61, 0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 90,
            display: 'block',
          }}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        style={{
          width: isCollapsed ? '72px' : '264px',
          backgroundColor: colors.deepForestGreen,
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          transition: `width ${transitions.default}`,
          zIndex: 100,
          flexShrink: 0,
          position: isMobileOpen ? 'fixed' : 'sticky',
          top: 0,
          bottom: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          fontFamily: typography.fontFamily,
          boxShadow: isMobileOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {/* Sidebar Brand / Header */}
        <div
          style={{
            padding: isCollapsed ? '1rem 0.5rem' : '1.25rem 1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            position: 'relative',
            minHeight: '64px',
            boxSizing: 'border-box',
          }}
        >
          {/* Logo & Brand text */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
            }}
            onClick={() => onRouteChange('command-center')}
            title="Go to Command Center"
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: radii.md,
                backgroundColor: colors.primaryGreen,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              <Leaf size={20} color="#FFFFFF" strokeWidth={2.2} />
            </div>

            {!isCollapsed && (
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <div
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.bold,
                    letterSpacing: '0.02em',
                    lineHeight: 1.2,
                    color: '#FFFFFF',
                  }}
                >
                  Grievance Admin
                </div>
                <div
                  style={{
                    fontSize: '0.68rem',
                    color: colors.secondaryGreen,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  Autonomous Ops
                </div>
              </div>
            )}
          </div>

          {/* Action buttons: Mobile Close & Desktop Collapse */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {/* Mobile Close Button */}
            {isMobileOpen && onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close sidebar"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  borderRadius: radii.sm,
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            )}

            {/* Desktop Collapse / Expand Toggle */}
            {!isMobileOpen && onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: colors.secondaryGreen,
                  cursor: 'pointer',
                  borderRadius: radii.sm,
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: `all ${transitions.fast}`,
                }}
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <nav
          style={{
            flex: 1,
            padding: isCollapsed ? '0.75rem 0.35rem' : '1rem 0.65rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.15rem',
          }}
        >
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <div
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: typography.fontWeight.bold,
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    color: colors.secondaryGreen,
                    padding: '0 0.75rem 0.35rem',
                    userSelect: 'none',
                    opacity: 0.85,
                  }}
                >
                  {section.title}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {section.items.map((item) => {
                  const isActive = activeRoute === item.id;
                  const isHovered = hoveredRoute === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onRouteChange(item.id);
                        if (isMobileOpen && onCloseMobile) onCloseMobile();
                      }}
                      onMouseEnter={() => setHoveredRoute(item.id)}
                      onMouseLeave={() => setHoveredRoute(null)}
                      title={isCollapsed ? `${item.label} — ${item.description}` : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        width: '100%',
                        padding: isCollapsed ? '0.65rem 0' : '0.55rem 0.75rem',
                        borderRadius: radii.md,
                        backgroundColor: isActive
                          ? colors.primaryGreen
                          : isHovered
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'transparent',
                        color: isActive ? '#FFFFFF' : isHovered ? '#FFFFFF' : '#C1D5CD',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: typography.fontFamily,
                        fontSize: typography.fontSize.sm,
                        fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
                        transition: `all ${transitions.fast}`,
                        outline: 'none',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.7rem',
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? '#FFFFFF' : isHovered ? '#FFFFFF' : colors.secondaryGreen,
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.label}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: typography.fontWeight.bold,
                            backgroundColor: isActive ? 'rgba(255,255,255,0.22)' : 'rgba(106, 146, 130, 0.3)',
                            color: isActive ? '#FFFFFF' : colors.secondaryGreen,
                            padding: '0.1rem 0.4rem',
                            borderRadius: radii.full,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Active indicator bar on collapsed state */}
                      {isCollapsed && isActive && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '15%',
                            bottom: '15%',
                            width: '3px',
                            backgroundColor: colors.secondaryGreen,
                            borderRadius: '0 2px 2px 0',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer — Status & Officer Profile */}
        <div
          style={{
            padding: isCollapsed ? '0.85rem 0.4rem' : '0.85rem 0.85rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.18)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: radii.full,
                backgroundColor: colors.secondaryGreen,
                color: colors.deepForestGreen,
                fontWeight: typography.fontWeight.bold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: typography.fontSize.xs,
                flexShrink: 0,
              }}
              title="Super Administrator"
            >
              SA
            </div>
            {!isCollapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Admin Console
                </div>
                <div
                  style={{
                    fontSize: '0.68rem',
                    color: colors.secondaryGreen,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: radii.full,
                      backgroundColor: '#34D399',
                      display: 'inline-block',
                    }}
                  />
                  Live Telemetry
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
