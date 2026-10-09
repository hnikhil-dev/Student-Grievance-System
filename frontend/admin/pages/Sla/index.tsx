import React, { useState, useMemo, useEffect } from 'react';
import {
  MOCK_SLA_GRIEVANCES,
  MOCK_SLA_METRICS,
  SlaGrievanceItem,
} from '../../services/slaData';
import { adminApiService } from '../../services/adminApiService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Modal } from '../../components/ui/Modal';
import { colors, typography, radii, shadows, transitions } from '../../tokens';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Eye,
  RefreshCw,
  Send,
  SlidersHorizontal,
  ChevronRight,
} from '../../components/ui/Icons';
import { AlertOctagon } from 'lucide-react';

export const SlaPage: React.FC = () => {
  const [grievances, setGrievances] = useState<SlaGrievanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');
  const [selectedHealthFilter, setSelectedHealthFilter] = useState<string>('ALL');
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<string>('ALL');
  const [activeItem, setActiveItem] = useState<SlaGrievanceItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Quick action states
  const [actionModalMode, setActionModalMode] = useState<'ASSIGN' | 'ESCALATE' | null>(null);
  const [assignedTechnician, setAssignedTechnician] = useState<string>('Assigned Field Officer');
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [escalationNote, setEscalationNote] = useState<string>('');

  // Load live SLA data and staff members from backend
  useEffect(() => {
    let isMounted = true;
    adminApiService.getStaffMembers().then((staff) => {
      if (isMounted && staff && staff.length > 0) {
        setAvailableStaff(staff);
        setAssignedTechnician(staff[0].full_name);
      }
    });
    adminApiService.getGrievances({ pageSize: 50 }).then((res) => {
      if (!isMounted) return;
      setIsLoading(false);
      if (res.items && res.items.length > 0) {
        const liveMapped: SlaGrievanceItem[] = res.items.map((g: any) => {
          const remaining = g.sla_status?.remainingMinutes ?? 60;
          const isBreached = g.sla_status?.isOverdue ?? false;
          const isWarning = g.sla_status?.isWarning ?? false;
          const health = isBreached ? 'BREACHED' : isWarning ? 'AT_RISK' : 'HEALTHY';
          return {
            id: g.id,
            ticketNumber: g.ticket_number,
            title: g.title,
            category: g.category || 'General',
            department: g.department?.name || 'Operations',
            priority: g.priority || 'MEDIUM',
            priorityScore: g.priority_score || 70,
            health,
            slaTargetHours: g.sla_status?.slaHours || 24,
            timeRemainingMinutes: remaining,
            elapsedPercentage: g.sla_status?.elapsedPercent || 50,
            owner: g.assignee?.full_name || 'Unassigned',
            currentStatus: g.status || 'SUBMITTED',
            escalationLevel: g.status === 'ESCALATED' ? 'Level 2' : 'Standard',
          };
        });
        setGrievances(liveMapped);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live SLA metrics dynamically
  const liveSlaMetrics = useMemo(() => {
    const total = grievances.length;
    const withinSlaCount = grievances.filter((g) => g.health === 'HEALTHY').length;
    const atRiskCount = grievances.filter((g) => g.health === 'AT_RISK').length;
    const breachedCount = grievances.filter((g) => g.health === 'BREACHED').length;
    const overallSlaPercentage = total > 0 ? Math.round(((withinSlaCount + atRiskCount) / total) * 100) : 100;
    const criticalAtRisk30m = grievances.filter((g) => g.health === 'AT_RISK' && g.timeRemainingMinutes <= 30 && g.timeRemainingMinutes >= 0).length;

    return {
      overallSlaPercentage,
      withinSlaCount,
      atRiskCount,
      breachedCount,
      criticalAtRisk30m,
    };
  }, [grievances]);

  const filteredItems = useMemo(() => {
    return grievances.filter((item) => {
      if (selectedDeptFilter !== 'ALL' && item.department !== selectedDeptFilter) return false;
      if (selectedPriorityFilter !== 'ALL' && item.priority !== selectedPriorityFilter) return false;
      if (selectedHealthFilter !== 'ALL' && item.health !== selectedHealthFilter) return false;

      if (selectedTimeWindow === 'UNDER_30M' && (item.timeRemainingMinutes > 30 || item.timeRemainingMinutes < 0)) return false;
      if (selectedTimeWindow === 'UNDER_1H' && (item.timeRemainingMinutes > 60 || item.timeRemainingMinutes < 0)) return false;
      if (selectedTimeWindow === 'BREACHED' && item.health !== 'BREACHED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchId = item.ticketNumber.toLowerCase().includes(q);
        const matchOwner = item.owner.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchOwner) return false;
      }
      return true;
    });
  }, [grievances, selectedDeptFilter, selectedPriorityFilter, selectedHealthFilter, selectedTimeWindow, searchQuery]);

  const atRiskItems = useMemo(() => grievances.filter((g) => g.health === 'AT_RISK'), [grievances]);
  const breachedItems = useMemo(() => grievances.filter((g) => g.health === 'BREACHED'), [grievances]);

  const getHealthBadge = (health: SlaGrievanceItem['health']) => {
    switch (health) {
      case 'HEALTHY':
        return (
          <span style={{ color: colors.success, backgroundColor: '#E7F4EE', border: '1px solid #C4E3D5', padding: '0.2rem 0.5rem', borderRadius: radii.sm, fontWeight: 700, fontSize: typography.fontSize.xs }}>
            ● Healthy
          </span>
        );
      case 'AT_RISK':
        return (
          <span style={{ color: colors.warning, backgroundColor: '#FBF5E9', border: '1px solid #EEDBB9', padding: '0.2rem 0.5rem', borderRadius: radii.sm, fontWeight: 700, fontSize: typography.fontSize.xs, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <AlertTriangle size={11} /> At Risk
          </span>
        );
      case 'BREACHED':
        return (
          <span style={{ color: colors.danger, backgroundColor: '#FAECEB', border: '1px solid #ECC7C4', padding: '0.2rem 0.5rem', borderRadius: radii.sm, fontWeight: 700, fontSize: typography.fontSize.xs, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <AlertOctagon size={11} /> Breached
          </span>
        );
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    try {
      await adminApiService.assignGrievance(
        activeItem.id,
        'a0000000-0000-0000-0000-000000000001',
        undefined,
        `Assigned ${assignedTechnician} via SLA Radar`
      );
    } catch {}
    setGrievances((prev) =>
      prev.map((g) => (g.id === activeItem.id ? { ...g, owner: assignedTechnician, currentStatus: 'ASSIGNED' } : g))
    );
    setFeedback(`Assigned ${assignedTechnician} to ${activeItem.ticketNumber}. Directives logged.`);
    setActionModalMode(null);
    setActiveItem(null);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    try {
      await adminApiService.escalateGrievance(activeItem.id, escalationNote || 'SLA breached threshold');
    } catch {}
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === activeItem.id
          ? {
              ...g,
              escalationLevel: 'Level 2 (Executive Dean Intervention)',
              currentStatus: 'ESCALATED',
            }
          : g
      )
    );
    setFeedback(`Escalated ${activeItem.ticketNumber} to Level-2 Dean Intervention.`);
    setActionModalMode(null);
    setActiveItem(null);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontFamily: typography.fontFamily }}>
      {/* 1. Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: colors.cardSurface,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          padding: '1.5rem',
          boxShadow: shadows.card,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <Clock size={24} color={colors.primaryGreen} />
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.deepForestGreen,
                letterSpacing: '-0.02em',
              }}
            >
              SLA Monitoring & Countdown Radar
            </h2>
            <Badge variant="success" size="sm">
              Watchdog Active
            </Badge>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: typography.fontSize.sm,
              color: colors.secondaryText,
              maxWidth: '680px',
              lineHeight: 1.5,
            }}
          >
            Real-time threshold surveillance alerting on healthy, at-risk, and breached resolution milestones across university departments.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            backgroundColor: colors.lightBotanical,
            border: `1px solid ${colors.secondaryGreen}`,
            borderRadius: radii.md,
            padding: '0.65rem 1rem',
            color: colors.deepForestGreen,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} color={colors.success} />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. Top Metrics */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Overall SLA %</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.primaryGreen, margin: '0.25rem 0' }}>
            {liveSlaMetrics.overallSlaPercentage}%
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Target: 95.0% institutional goal</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.primaryGreen }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Within SLA (Healthy)</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.success, margin: '0.25rem 0' }}>
            {liveSlaMetrics.withinSlaCount}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.success }}>On scheduled delivery track</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.success }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>At Risk (&lt; 2 Hours)</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.warning, margin: '0.25rem 0' }}>
            {liveSlaMetrics.atRiskCount}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.warning }}>{liveSlaMetrics.criticalAtRisk30m} imminent within 30 mins</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.warning }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Breached (Overdue)</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.danger, margin: '0.25rem 0' }}>
            {liveSlaMetrics.breachedCount}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.danger }}>Immediate Dean escalation triggered</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.danger }} />
        </div>
      </section>

      {/* 3. At-Risk & Breached Actionable Banners */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {/* At-Risk Callout */}
        <div style={{ backgroundColor: '#FBF5E9', border: '1px solid #EEDBB9', borderRadius: radii.md, padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: colors.warning, fontSize: typography.fontSize.sm, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <AlertTriangle size={15} /> At-Risk Queue ({atRiskItems.length} Urgent Tickets)
            </span>
            <Badge variant="warning" size="sm">Action Priority</Badge>
          </div>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
            Tickets with elapsed SLA over 75% requiring immediate technician dispatch before breach.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {atRiskItems.map((it) => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.cardSurface, padding: '0.4rem 0.6rem', borderRadius: radii.sm, fontSize: typography.fontSize.xs }}>
                <span style={{ fontWeight: 600, color: colors.deepForestGreen }}>{it.ticketNumber}: {it.title.substring(0, 38)}...</span>
                <span style={{ color: colors.warning, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={12} /> {it.timeRemainingFormatted}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Breached Callout */}
        <div style={{ backgroundColor: '#FAECEB', border: '1px solid #ECC7C4', borderRadius: radii.md, padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: colors.danger, fontSize: typography.fontSize.sm, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <AlertOctagon size={15} /> Breached Queue ({breachedItems.length} Overdue Incidents)
            </span>
            <Badge variant="danger" size="sm">Breach Flagged</Badge>
          </div>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
            Standard resolution window expired. Administrative memos queued for Dean review.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {breachedItems.map((it) => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.cardSurface, padding: '0.4rem 0.6rem', borderRadius: radii.sm, fontSize: typography.fontSize.xs }}>
                <span style={{ fontWeight: 600, color: colors.danger }}>{it.ticketNumber}: {it.title.substring(0, 38)}...</span>
                <span style={{ color: colors.danger, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <AlertOctagon size={12} /> {it.timeRemainingFormatted}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Filters */}
      <Card variant="flat">
        <CardContent style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ minWidth: '240px', flex: '1 1 240px' }}>
              <SearchInput
                placeholder="Search ticket number, title, or assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Status:</span>
                <select
                  value={selectedHealthFilter}
                  onChange={(e) => setSelectedHealthFilter(e.target.value)}
                  style={{
                    fontFamily: typography.fontFamily,
                    fontSize: typography.fontSize.xs,
                    color: colors.primaryText,
                    backgroundColor: colors.cardSurface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.md,
                    padding: '0.4rem 0.65rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">All SLA Statuses</option>
                  <option value="HEALTHY">Healthy (Green)</option>
                  <option value="AT_RISK">At Risk (Amber)</option>
                  <option value="BREACHED">Breached (Red)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Window:</span>
                <select
                  value={selectedTimeWindow}
                  onChange={(e) => setSelectedTimeWindow(e.target.value)}
                  style={{
                    fontFamily: typography.fontFamily,
                    fontSize: typography.fontSize.xs,
                    color: colors.primaryText,
                    backgroundColor: colors.cardSurface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.md,
                    padding: '0.4rem 0.65rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">All Windows</option>
                  <option value="UNDER_30M">&lt; 30 Minutes Remaining</option>
                  <option value="UNDER_1H">&lt; 1 Hour Remaining</option>
                  <option value="BREACHED">Breached</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Department:</span>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  style={{
                    fontFamily: typography.fontFamily,
                    fontSize: typography.fontSize.xs,
                    color: colors.primaryText,
                    backgroundColor: colors.cardSurface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.md,
                    padding: '0.4rem 0.65rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">All Departments</option>
                  <option value="Technical">Technical</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Academic">Academic</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. SLA Monitoring Table */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <CardTitle>Active Grievance SLA Register</CardTitle>
              <CardDescription>Click any row to inspect timeline checkpoints and dispatch quick actions</CardDescription>
            </div>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
              Showing {filteredItems.length} monitored tickets
            </span>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: typography.fontSize.sm }}>
              <thead>
                <tr style={{ backgroundColor: colors.adminBackground, borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.deepForestGreen }}>Grievance</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Department</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Priority</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>SLA Target</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Time Remaining</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Owner</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem 1rem', textAlign: 'center', color: colors.secondaryText }}>
                      <Clock size={32} color={colors.secondaryGreen} style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
                      <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginBottom: '0.25rem' }}>
                        No Active SLA Tickets Found
                      </div>
                      <div style={{ fontSize: typography.fontSize.xs }}>
                        All tracked tickets have been resolved, or none match current filters.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: idx % 2 === 0 ? colors.cardSurface : colors.adminBackground,
                      cursor: 'pointer',
                      transition: transitions.fast,
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', maxWidth: '240px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: colors.deepForestGreen, fontSize: typography.fontSize.xs }}>
                        {item.ticketNumber}
                      </div>
                      <div style={{ fontWeight: 500, color: colors.primaryText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <Badge variant="neutral" size="sm">{item.department}</Badge>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <PriorityBadge level={item.priority} />
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: colors.secondaryText, fontSize: typography.fontSize.xs }}>
                      {item.slaTargetFormatted}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: typography.fontSize.xs,
                          color: item.health === 'BREACHED' ? colors.danger : item.health === 'AT_RISK' ? colors.warning : colors.success,
                        }}
                      >
                        ⏱ {item.timeRemainingFormatted}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      {getHealthBadge(item.health)}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontSize: typography.fontSize.xs, color: colors.primaryText }}>
                      {item.owner}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setActiveItem(item); }}>
                        Inspect →
                      </Button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 6. SLA Detail Modal */}
      {activeItem && !actionModalMode && (
        <Modal
          isOpen={true}
          onClose={() => setActiveItem(null)}
          title={`SLA Surveillance: ${activeItem.ticketNumber}`}
          description={`Target: ${activeItem.slaTargetFormatted} • Escalation Tier: ${activeItem.escalationLevel}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: typography.fontSize.sm }}>
            <div style={{ backgroundColor: colors.adminBackground, padding: '1rem', borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
              <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginBottom: '0.25rem' }}>
                {activeItem.title}
              </div>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
                Department: <strong>{activeItem.department}</strong> • Student: <strong>{activeItem.studentName}</strong> • Current Owner: <strong>{activeItem.owner}</strong>
              </div>
            </div>

            {/* Visual SLA Progress Bar */}
            <div style={{ border: `1px solid ${colors.border}`, padding: '1rem', borderRadius: radii.md }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: typography.fontSize.xs }}>
                <span style={{ fontWeight: 600, color: colors.deepForestGreen }}>SLA Window Consumption:</span>
                <span style={{ fontWeight: 700, color: activeItem.health === 'BREACHED' ? colors.danger : activeItem.health === 'AT_RISK' ? colors.warning : colors.success }}>
                  {activeItem.elapsedPercent}% Elapsed ({activeItem.timeRemainingFormatted})
                </span>
              </div>
              <div style={{ height: '10px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, activeItem.elapsedPercent)}%`,
                    backgroundColor: activeItem.health === 'BREACHED' ? colors.danger : activeItem.health === 'AT_RISK' ? colors.warning : colors.primaryGreen,
                    height: '100%',
                  }}
                />
              </div>
            </div>

            {/* Checkpoint Timeline Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: typography.fontSize.xs }}>
              <div style={{ backgroundColor: colors.adminBackground, padding: '0.75rem', borderRadius: radii.md }}>
                <span style={{ color: colors.secondaryText }}>Submitted At:</span>
                <div style={{ fontWeight: 600, color: colors.primaryText, marginTop: '0.15rem' }}>{activeItem.createdAt}</div>
              </div>
              <div style={{ backgroundColor: colors.adminBackground, padding: '0.75rem', borderRadius: radii.md }}>
                <span style={{ color: colors.secondaryText }}>First Response:</span>
                <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginTop: '0.15rem' }}>{activeItem.firstResponseAt}</div>
              </div>
              <div style={{ backgroundColor: colors.adminBackground, padding: '0.75rem', borderRadius: radii.md }}>
                <span style={{ color: colors.secondaryText }}>Current Status:</span>
                <div style={{ fontWeight: 600, color: colors.primaryText, marginTop: '0.15rem' }}>{activeItem.currentStatus}</div>
              </div>
              <div style={{ backgroundColor: colors.adminBackground, padding: '0.75rem', borderRadius: radii.md }}>
                <span style={{ color: colors.secondaryText }}>Escalation Level:</span>
                <div style={{ fontWeight: 600, color: colors.danger, marginTop: '0.15rem' }}>{activeItem.escalationLevel}</div>
              </div>
            </div>

            {activeItem.breachReason && (
              <div style={{ backgroundColor: '#FAECEB', border: '1px solid #ECC7C4', padding: '0.75rem', borderRadius: radii.md, fontSize: typography.fontSize.xs, color: colors.danger }}>
                <strong>Breach Factor:</strong> {activeItem.breachReason}
              </div>
            )}

            {/* Actions: Assign / Escalate */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: `1px solid ${colors.border}`, paddingTop: '0.85rem' }}>
              <Button variant="secondary" size="sm" onClick={() => setActiveItem(null)}>
                Close
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActionModalMode('ASSIGN')}>
                Assign Specialist
              </Button>
              <Button variant="danger" size="sm" onClick={() => setActionModalMode('ESCALATE')}>
                Trigger Escalation Memo
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Modal */}
      {actionModalMode === 'ASSIGN' && activeItem && (
        <Modal
          isOpen={true}
          onClose={() => setActionModalMode(null)}
          title={`Assign Field Specialist: ${activeItem.ticketNumber}`}
          description="Allocate expedited field handling to meet SLA targets."
        >
          <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: typography.fontSize.sm }}>
            <div>
              <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.35rem' }}>
                Select On-Duty Officer:
              </label>
              <select
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  fontFamily: typography.fontFamily,
                  color: colors.primaryText,
                }}
              >
                {availableStaff.length > 0 ? (
                  availableStaff.map((s) => (
                    <option key={s.id} value={s.full_name}>
                      {s.full_name} ({s.role.replace(/_/g, ' ')} - {s.department?.name || 'Central'})
                    </option>
                  ))
                ) : (
                  <option value="Assigned Field Officer">Assigned Field Officer</option>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button variant="ghost" size="sm" type="button" onClick={() => setActionModalMode(null)}>Cancel</Button>
              <Button variant="primary" size="sm" type="submit">Confirm Assignment</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Escalate Modal */}
      {actionModalMode === 'ESCALATE' && activeItem && (
        <Modal
          isOpen={true}
          onClose={() => setActionModalMode(null)}
          title={`File SLA Escalation Memo: ${activeItem.ticketNumber}`}
          description="Dispatch immediate administrative memo to Department Head & Student Welfare Dean."
        >
          <form onSubmit={handleEscalateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: typography.fontSize.sm }}>
            <div>
              <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.35rem' }}>
                Escalation Justification:
              </label>
              <textarea
                required
                rows={3}
                value={escalationNote}
                onChange={(e) => setEscalationNote(e.target.value)}
                placeholder="Detail the SLA breach risks or immediate intervention requirements..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  fontFamily: typography.fontFamily,
                  color: colors.primaryText,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button variant="ghost" size="sm" type="button" onClick={() => setActionModalMode(null)}>Cancel</Button>
              <Button variant="danger" size="sm" type="submit">Dispatch Escalation</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
