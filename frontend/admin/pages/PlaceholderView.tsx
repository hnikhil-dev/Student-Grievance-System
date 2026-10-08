import React, { useState } from 'react';
import { AdminRouteId } from '../types/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Modal } from '../components/ui/Modal';
import { colors, typography } from '../tokens';

interface ModuleMetadata {
  title: string;
  phase: number;
  icon: string;
  description: string;
  plannedFeatures: string[];
}

const MODULE_DATA: Record<AdminRouteId, ModuleMetadata> = {
  'command-center': {
    title: 'Admin Command Center',
    phase: 1,
    icon: '🎛️',
    description: 'Executive triage queue, real-time grievance pulse, and immediate action dispatcher.',
    plannedFeatures: [
      'Institutional live incident feed',
      'Real-time SLA health countdown radar',
      'Priority score sorting & rapid officer assignment',
      'Executive KPI metric summary ribbon',
    ],
  },
  'departments': {
    title: 'Department Dashboard',
    phase: 2,
    icon: '🏛️',
    description: 'Departmental workload balance, officer queues, and unit-level SLA compliance.',
    plannedFeatures: [
      'IT, Hostel, Maintenance, Academics workload distribution',
      'Officer capacity & resolution rate tracker',
      'Inter-departmental grievance routing reassignments',
      'Department-specific performance metrics',
    ],
  },
  'classification': {
    title: 'AI Classification',
    phase: 3,
    icon: '🏷️',
    description: 'Autonomous symptom tagging, natural language intent extraction, and department routing.',
    plannedFeatures: [
      'Multi-class complaint taxonomy classifier',
      'Explainable token evidence and confidence scoring',
      'Deterministic rule engine fallback boundary',
      'Human-in-the-loop classification overrides',
    ],
  },
  'priority': {
    title: 'Priority Engine',
    phase: 4,
    icon: '⚡',
    description: 'Deterministic and AI-assisted multi-factor priority scoring matrix.',
    plannedFeatures: [
      'Severity (Low, Moderate, High, Critical) calculation',
      'Urgency & student cohort impact scaling',
      'Academic calendar context multipliers (Exam hall incidents)',
      'Transparent scoring audit trace',
    ],
  },
  'duplicates': {
    title: 'Duplicate Detection',
    phase: 5,
    icon: '🔗',
    description: 'Semantic vector similarity analysis to detect repeat and related complaints.',
    plannedFeatures: [
      'Embedding-based semantic text matching',
      'Time-window & location proximity clustering',
      'Parent-child ticket linking with bulk resolution',
      'Deduplication confidence threshold manager',
    ],
  },
  'clusters': {
    title: 'Clustering',
    phase: 6,
    icon: '🧩',
    description: 'Automated grouping of systemic campus issues to diagnose root causes.',
    plannedFeatures: [
      'Unsupervised incident cluster formation',
      'Campus infrastructure outage blast radius detection',
      'Root-cause synthesis memos',
      'Cluster-wide broadcast notices to affected students',
    ],
  },
  'sla': {
    title: 'SLA Monitoring',
    phase: 7,
    icon: '⏱️',
    description: 'Continuous watchdog tracking resolution timeframes against institutional SLAs.',
    plannedFeatures: [
      'Priority-based resolution countdown timers',
      'Warning alerts at 75% elapsed duration',
      'Pre-breach notification webhooks to department heads',
      'SLA breach risk predictive forecasting',
    ],
  },
  'escalation': {
    title: 'Escalation',
    phase: 8,
    icon: '📣',
    description: 'Hierarchical intervention engine for unresolved and critical grievances.',
    plannedFeatures: [
      'Automated multi-tier escalation hierarchy (Officer -> HOD -> Dean)',
      'Manual officer escalation memos with audit trails',
      'Executive Provost notification dispatch',
      'De-escalation resolution sign-offs',
    ],
  },
  'analytics': {
    title: 'Analytics',
    phase: 9,
    icon: '📊',
    description: 'Comprehensive historical reports, resolution velocity, and satisfaction metrics.',
    plannedFeatures: [
      '14-day & 90-day grievance intake vs resolution trends',
      'Category & department breakdown charts',
      'Average resolution duration in hours',
      'Student satisfaction feedback ratings (1-5 Stars)',
    ],
  },
  'insights': {
    title: 'AI Insights',
    phase: 10,
    icon: '💡',
    description: 'Predictive intelligence, bottleneck diagnosis, and preventive recommendations.',
    plannedFeatures: [
      'Campus infrastructure failure pattern prediction',
      'Officer bottleneck diagnosis & resource balancing',
      'Seasonal grievance anomaly detection',
      'Executive policy recommendation memos',
    ],
  },
};

export interface PlaceholderViewProps {
  routeId: AdminRouteId;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ routeId }) => {
  const meta = MODULE_DATA[routeId];
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FOUNDATION_SHOWCASE'>('OVERVIEW');
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner: Coming in next implementation phase */}
      <div
        style={{
          backgroundColor: colors.cardSurface,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: colors.lightBotanical,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
            }}
          >
            {meta.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.deepForestGreen,
                }}
              >
                {meta.title}
              </h2>
              <Badge variant="warning" size="sm">
                Phase {meta.phase}
              </Badge>
            </div>
            <p style={{ margin: 0, fontSize: typography.fontSize.sm, color: colors.secondaryText }}>
              {meta.description}
            </p>
          </div>
        </div>

        {/* Phase Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              backgroundColor: colors.warmCream,
              border: `1px solid ${colors.softBeige}`,
              color: colors.primaryText,
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            Coming in next implementation phase
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: `1px solid ${colors.border}` }}>
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          style={{
            padding: '0.5rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'OVERVIEW' ? colors.primaryGreen : 'transparent'}`,
            color: activeTab === 'OVERVIEW' ? colors.primaryGreen : colors.secondaryText,
            fontWeight: activeTab === 'OVERVIEW' ? 600 : 500,
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
          }}
        >
          Phase Roadmap & Scope
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FOUNDATION_SHOWCASE')}
          style={{
            padding: '0.5rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'FOUNDATION_SHOWCASE' ? colors.primaryGreen : 'transparent'}`,
            color: activeTab === 'FOUNDATION_SHOWCASE' ? colors.primaryGreen : colors.secondaryText,
            fontWeight: activeTab === 'FOUNDATION_SHOWCASE' ? 600 : 500,
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
          }}
        >
          Design System & UI Components (Phase 0)
        </button>
      </div>

      {/* Tab 1: Module Scope Overview */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.5rem' }}>
          <Card>
            <CardHeader>
              <CardTitle>Planned Implementation Scope</CardTitle>
              <CardDescription>
                Architectural goals mapped out for Phase {meta.phase} of the Admin System.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {meta.plannedFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: colors.adminBackground,
                      borderRadius: '6px',
                      border: `1px solid ${colors.border}`,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    <span style={{ color: colors.primaryGreen, fontWeight: 'bold' }}>✓</span>
                    <span style={{ color: colors.primaryText }}>{feat}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Architecture Isolation Notice Card */}
          <Card variant="highlight">
            <CardHeader>
              <CardTitle>Phase 0 Foundation Active</CardTitle>
              <CardDescription>
                Strict isolation: Only frontend/admin files are active.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: typography.fontSize.sm }}>
                <div>
                  <strong>Visual Identity:</strong> Soft botanical green (#427B65) and deep forest green (#14433D) surfaces matching institutional standards.
                </div>
                <div>
                  <strong>Navigation Architecture:</strong> Full 10-module hierarchy with persistent sidebar, responsive header, and accessible keyboard navigation.
                </div>
                <div>
                  <strong>State Foundation:</strong> Standardized Loading, Empty, and Error states ready for data services.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Interactive Foundation UI Showcase (Buttons, Cards, States, Modal) */}
      {activeTab === 'FOUNDATION_SHOWCASE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stat Cards Row */}
          <div>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: typography.fontSize.md, color: colors.deepForestGreen }}>
              StatCard Components
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <StatCard
                title="Total Grievances"
                value="148"
                subtitle="Institutional aggregate"
                icon="📋"
                trend={{ value: '12% this month', isPositive: true }}
                accentColor={colors.primaryGreen}
              />
              <StatCard
                title="Active Triage"
                value="24"
                subtitle="In-progress investigations"
                icon="⏳"
                accentColor={colors.secondaryGreen}
              />
              <StatCard
                title="SLA Compliance"
                value="94.6%"
                subtitle="Target: > 90%"
                icon="⏱️"
                trend={{ value: '1.4% improvement', isPositive: true }}
                accentColor={colors.success}
              />
              <StatCard
                title="SLA Breached"
                value="3"
                subtitle="Requiring escalation"
                icon="⚠️"
                trend={{ value: '2 resolved', isPositive: false }}
                accentColor={colors.danger}
              />
            </div>
          </div>

          {/* Badges & Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Button & Badge Design System</CardTitle>
              <CardDescription>
                Semantic variants built strictly with the botanical palette.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Buttons */}
                <div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.5rem', fontWeight: 600 }}>
                    BUTTON VARIANTS:
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="danger">Danger Button</Button>
                    <Button
                      variant="primary"
                      isLoading={demoLoading}
                      onClick={() => {
                        setDemoLoading(true);
                        setTimeout(() => setDemoLoading(false), 1500);
                      }}
                    >
                      {demoLoading ? 'Processing...' : 'Click for Loading State'}
                    </Button>
                    <Button variant="secondary" onClick={() => setIsSampleModalOpen(true)}>
                      Open Accessible Modal
                    </Button>
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.5rem', fontWeight: 600 }}>
                    STATUS & PRIORITY BADGES:
                  </div>
                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <StatusBadge status="success" label="Active / Healthy" />
                    <StatusBadge status="warning" label="Warning / Review" />
                    <StatusBadge status="danger" label="Critical / Overdue" />
                    <StatusBadge status="info" label="AI Enriched" />
                    <StatusBadge status="neutral" label="Archived" />
                    <PriorityBadge level="CRITICAL" score={95} />
                    <PriorityBadge level="HIGH" score={82} />
                    <PriorityBadge level="MEDIUM" score={60} />
                    <PriorityBadge level="LOW" score={25} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Standardized UI States Grid */}
          <div>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: typography.fontSize.md, color: colors.deepForestGreen }}>
              Standardized State Handlers (Phase 0 Requirement)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {/* Loading State */}
              <Card>
                <CardHeader>
                  <CardTitle>Loading State</CardTitle>
                  <CardDescription>Calm botanical spinner and skeleton feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <LoadingState message="Fetching grievance taxonomy..." />
                </CardContent>
              </Card>

              {/* Empty State */}
              <Card>
                <CardHeader>
                  <CardTitle>Empty State</CardTitle>
                  <CardDescription>Used when zero records match filters</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    title="No Open Tickets"
                    description="All student grievances in this department queue have been reviewed."
                    actionLabel="Refresh Triage"
                    onAction={() => alert('Phase 0 foundation action')}
                  />
                </CardContent>
              </Card>

              {/* Error State */}
              <Card>
                <CardHeader>
                  <CardTitle>Error State</CardTitle>
                  <CardDescription>Controlled error handling with retry trigger</CardDescription>
                </CardHeader>
                <CardContent>
                  <ErrorState
                    title="Gateway Communication Error"
                    message="Unable to reach the institutional grievance API. Verify network credentials."
                    onRetry={() => alert('Retrying service request...')}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Sample Modal */}
      <Modal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        title="Admin Confirmation Dialog"
        description="Phase 0 Accessible Modal with escape key and backdrop handling."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsSampleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsSampleModalOpen(false)}>
              Confirm Action
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: typography.fontSize.sm, color: colors.primaryText, lineHeight: 1.5 }}>
          This modal is part of the Phase 0 Admin Foundation component library. It supports keyboard accessibility (Escape to dismiss), trap focus, and botanical styling.
        </p>
      </Modal>
    </div>
  );
};
