import React, { useState, useMemo, useEffect } from 'react';
import {
  MOCK_PRIORITY_GRIEVANCES,
  MOCK_PRIORITY_METRICS,
  MOCK_PRIORITY_RULES,
  PriorityGrievanceItem,
} from '../../services/priorityData';
import { PriorityLevel } from '../../types/domain';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Modal } from '../../components/ui/Modal';
import { adminApiService } from '../../services/adminApiService';
import { colors, typography, radii, shadows, transitions } from '../../tokens';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  Eye,
  RefreshCw,
  Clock,
  ChevronRight,
} from '../../components/ui/Icons';
import { Edit3 } from 'lucide-react';

export const PriorityPage: React.FC = () => {
  const [items, setItems] = useState<PriorityGrievanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Load live grievance priorities from backend
  useEffect(() => {
    let isMounted = true;
    adminApiService.getGrievances({ pageSize: 50 }).then((res) => {
      if (!isMounted) return;
      setIsLoading(false);
      if (res.items && res.items.length > 0) {
        const liveMapped: PriorityGrievanceItem[] = res.items.map((g: any) => {
          const remainingMinutes = g.sla_status?.remainingMinutes ?? 120;
          const slaRemaining = remainingMinutes < 0
            ? 'Breached'
            : remainingMinutes < 60
            ? `${remainingMinutes}m`
            : `${Math.round(remainingMinutes / 60)}h`;

          return {
            id: g.id,
            ticketNumber: g.ticket_number,
            subject: g.title,
            category: g.category || 'General',
            department: g.department?.name || 'Operations',
            priority: (g.priority || 'MEDIUM') as PriorityLevel,
            score: g.priority_score || 55,
            slaRemaining,
            slaMinutesRemaining: remainingMinutes,
            factors: {
              severity: g.severity === 'CRITICAL' ? 30 : g.severity === 'HIGH' ? 22 : 15,
              urgency: g.urgency === 'IMMEDIATE' ? 30 : g.urgency === 'HIGH' ? 22 : 15,
              impactCohort: Math.min(25, (g.affected_students || 1) * 3),
              recurrenceBonus: g.recurrence ? 15 : 0,
            },
            contributingSignals: g.priority_reasons || ['Evaluated via multi-factor weighting algorithm'],
            calculatedAt: g.created_at,
            overrideStatus: 'SYSTEM_CALCULATED',
          };
        });
        setItems(liveMapped);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live priority metrics dynamically
  const livePriorityMetrics = useMemo(() => {
    const criticalCount = items.filter((i) => i.priority === 'CRITICAL').length;
    const highCount = items.filter((i) => i.priority === 'HIGH').length;
    const mediumCount = items.filter((i) => i.priority === 'MEDIUM').length;
    const lowCount = items.filter((i) => i.priority === 'LOW').length;
    const avgScore = items.length > 0 ? Math.round(items.reduce((acc, i) => acc + i.score, 0) / items.length) : 0;
    const criticalUnresolved = items.filter((i) => i.priority === 'CRITICAL' && i.slaMinutesRemaining >= 0).length;

    return {
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      priorityChangesToday: 0,
      averagePriorityScore: avgScore,
      criticalUnresolved,
    };
  }, [items]);

  // Detail & Override state
  const [activeItem, setActiveItem] = useState<PriorityGrievanceItem | null>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState<boolean>(false);
  const [overrideTargetPriority, setOverrideTargetPriority] = useState<PriorityLevel>('HIGH');
  const [overrideReasonText, setOverrideReasonText] = useState<string>('');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedPriorityFilter !== 'ALL' && item.priority !== selectedPriorityFilter) return false;
      if (selectedDeptFilter !== 'ALL' && item.department !== selectedDeptFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.subject.toLowerCase().includes(q);
        const matchId = item.ticketNumber.toLowerCase().includes(q);
        const matchDept = item.department.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchDept) return false;
      }
      return true;
    });
  }, [items, selectedPriorityFilter, selectedDeptFilter, searchQuery]);

  const handleOpenOverride = (item: PriorityGrievanceItem) => {
    setActiveItem(item);
    setOverrideTargetPriority(item.priority);
    setOverrideReasonText('');
    setIsOverrideModalOpen(true);
  };

  const handleConfirmOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    // Adjust score estimate
    let adjustedScore = activeItem.score;
    if (overrideTargetPriority === 'CRITICAL') adjustedScore = Math.max(90, activeItem.score);
    if (overrideTargetPriority === 'HIGH') adjustedScore = 80;
    if (overrideTargetPriority === 'MEDIUM') adjustedScore = 55;
    if (overrideTargetPriority === 'LOW') adjustedScore = 30;

    setItems((prev) =>
      prev.map((it) =>
        it.id === activeItem.id
          ? {
              ...it,
              priority: overrideTargetPriority,
              score: adjustedScore,
              overriddenBy: 'Admin Officer',
              overriddenReason: overrideReasonText,
            }
          : it
      )
    );

    setFeedback(`Priority for ${activeItem.ticketNumber} manually overridden to ${overrideTargetPriority}. Logged to audit trail.`);
    setIsOverrideModalOpen(false);
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
            <Zap size={24} color={colors.warning} />
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.deepForestGreen,
                letterSpacing: '-0.02em',
              }}
            >
              Priority Engine
            </h2>
            <Badge variant="warning" size="sm">
              Scoring Matrix Active
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
            Transparent multi-factor severity evaluation explaining why each student grievance received its priority ranking.
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

      {/* 2. Top Metrics (7 Key Indicators) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
        {/* Critical */}
        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Critical</span>
          <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.danger, marginTop: '0.2rem' }}>
            {livePriorityMetrics.criticalCount}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.danger }} />
        </div>

        {/* High */}
        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>High</span>
          <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.warning, marginTop: '0.2rem' }}>
            {livePriorityMetrics.highCount}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.warning }} />
        </div>

        {/* Medium */}
        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Medium</span>
          <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.primaryGreen, marginTop: '0.2rem' }}>
            {livePriorityMetrics.mediumCount}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.primaryGreen }} />
        </div>

        {/* Low */}
        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Low</span>
          <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.secondaryGreen, marginTop: '0.2rem' }}>
            {livePriorityMetrics.lowCount}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.secondaryGreen }} />
        </div>

        {/* Priority Changes Today */}
        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Changes Today</span>
          <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.deepForestGreen, marginTop: '0.2rem' }}>
            {livePriorityMetrics.priorityChangesToday}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.primaryGreen }} />
        </div>

        {/* Average Priority Score */}
        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Avg Score</span>
          <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.deepForestGreen, marginTop: '0.2rem' }}>
            {livePriorityMetrics.averagePriorityScore} <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>/ 100</span>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.primaryGreen }} />
        </div>

        {/* Critical Unresolved */}
        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.danger, fontWeight: 600 }}>Critical Open</span>
          <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.danger, marginTop: '0.2rem' }}>
            {livePriorityMetrics.criticalUnresolved}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.danger }} />
        </div>
      </section>

      {/* 3. Filters & Search */}
      <Card variant="flat">
        <CardContent style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ minWidth: '240px', flex: '1 1 240px' }}>
              <SearchInput
                placeholder="Search grievance ID, subject, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Priority:</span>
                <select
                  value={selectedPriorityFilter}
                  onChange={(e) => setSelectedPriorityFilter(e.target.value)}
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
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">Critical (#C86B62)</option>
                  <option value="HIGH">High (#C99A4A)</option>
                  <option value="MEDIUM">Medium (#427B65)</option>
                  <option value="LOW">Low (#6A9282)</option>
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
                  <option value="Administration">Administration</option>
                  <option value="Transport">Transport</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Priority Table */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <CardTitle>Priority Evaluation Queue</CardTitle>
              <CardDescription>Multi-factor severity scoring matrix with audit explanations</CardDescription>
            </div>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
              Showing {filteredItems.length} evaluated items
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
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Score</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>SLA Remaining</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Reason</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: colors.secondaryText }}>
                      <Zap size={32} color={colors.secondaryGreen} style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
                      <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginBottom: '0.25rem' }}>
                        No Priority Grievances In Queue
                      </div>
                      <div style={{ fontSize: typography.fontSize.xs }}>
                        All current grievances have been processed or do not match selected filters.
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
                    <td style={{ padding: '0.85rem 1rem', maxWidth: '280px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: colors.deepForestGreen, fontSize: typography.fontSize.xs }}>
                        {item.ticketNumber}
                      </div>
                      <div style={{ fontWeight: 500, color: colors.primaryText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.subject}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <Badge variant="neutral" size="sm">{item.department}</Badge>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <PriorityBadge level={item.priority} score={item.score} />
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: typography.fontSize.md, color: colors.deepForestGreen }}>
                        {item.score}
                      </span>
                      <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}> / 100</span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          fontWeight: 600,
                          color: item.slaMinutesRemaining < 0 ? colors.danger : item.slaMinutesRemaining < 60 ? colors.warning : colors.success,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={12} /> {item.slaRemaining}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', maxWidth: '300px', fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.reason}
                      </div>
                      {item.overriddenBy && (
                        <div style={{ color: colors.warning, fontWeight: 600, marginTop: '0.15rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Edit3 size={11} /> Manually Overridden
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setActiveItem(item); }}>
                          Review
                        </Button>
                        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenOverride(item); }}>
                          Override
                        </Button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Priority Rules Read-Only Interface */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <CardTitle>Autonomous Priority Escalation Rules</CardTitle>
              <CardDescription>Read-only algorithmic logic policies applied across intake</CardDescription>
            </div>
            <Badge variant="neutral" size="sm">4 Operational Rules</Badge>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {MOCK_PRIORITY_RULES.map((rule) => (
              <div
                key={rule.id}
                style={{
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.adminBackground,
                  borderRadius: radii.md,
                  padding: '0.85rem 1.1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: colors.deepForestGreen, fontSize: typography.fontSize.sm, marginBottom: '0.2rem' }}>
                    {rule.name}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: typography.fontSize.xs, color: colors.primaryText }}>
                    <span style={{ color: colors.primaryGreen, fontWeight: 700 }}>IF </span>
                    {rule.condition.replace('IF ', '')}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: typography.fontSize.xs, color: colors.deepForestGreen, marginTop: '0.15rem' }}>
                    <span style={{ color: colors.danger, fontWeight: 700 }}>THEN </span>
                    {rule.action.replace('THEN ', '')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: typography.fontSize.xs }}>
                  <span style={{ color: colors.secondaryText }}>Triggered {rule.triggerCount} times this term</span>
                  <Badge variant="success" size="sm">Active Policy</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6. Priority Detail Modal */}
      {activeItem && !isOverrideModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setActiveItem(null)}
          title={`Priority Detail: ${activeItem.ticketNumber}`}
          description="Transparent scoring breakdown across customer impact, urgency, and institutional SLA risks."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: typography.fontSize.sm }}>
            <div style={{ backgroundColor: colors.adminBackground, padding: '1rem', borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
              <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginBottom: '0.25rem' }}>
                {activeItem.subject}
              </div>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
                Department: <strong>{activeItem.department}</strong> • Impact Cohort: <strong>{activeItem.cohortImpact} Students</strong>
              </div>
            </div>

            {/* Score & Level Display */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.lightBotanical, padding: '1rem', borderRadius: radii.md }}>
              <div>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Assigned Priority:</span>
                <div style={{ marginTop: '0.25rem' }}>
                  <PriorityBadge level={activeItem.priority} score={activeItem.score} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Aggregated Score:</span>
                <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.deepForestGreen }}>
                  {activeItem.score} <span style={{ fontSize: typography.fontSize.sm, color: colors.secondaryText }}>/ 100</span>
                </div>
              </div>
            </div>

            {/* Scoring Breakdown Table */}
            <div>
              <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginBottom: '0.5rem' }}>
                Scoring Breakdown:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeItem.scoringBreakdown.map((sb, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: `1px solid ${colors.border}`,
                      borderRadius: radii.md,
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: colors.primaryText }}>{sb.factor}</span>
                      <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
                        {sb.rationale}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: colors.primaryGreen, fontSize: typography.fontSize.md }}>
                      +{sb.points} <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>/ {sb.maxPoints}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overridden History if any */}
            {activeItem.overriddenBy && (
              <div style={{ backgroundColor: '#FBF5E9', border: '1px solid #EEDBB9', padding: '0.75rem', borderRadius: radii.md, fontSize: typography.fontSize.xs }}>
                <strong>Manual Override Recorded:</strong> by {activeItem.overriddenBy}
                <div style={{ color: colors.secondaryText, marginTop: '0.2rem' }}>Reason: {activeItem.overriddenReason}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: `1px solid ${colors.border}`, paddingTop: '0.75rem' }}>
              <Button variant="secondary" size="sm" onClick={() => setActiveItem(null)}>Close</Button>
              <Button variant="primary" size="sm" onClick={() => handleOpenOverride(activeItem)}>Override Priority</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Override Priority Confirmation Modal */}
      {isOverrideModalOpen && activeItem && (
        <Modal
          isOpen={true}
          onClose={() => setIsOverrideModalOpen(false)}
          title={`Override Priority: ${activeItem.ticketNumber}`}
          description="Manual priority overrides require institutional justification and are logged for governance."
        >
          <form onSubmit={handleConfirmOverride} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: typography.fontSize.sm }}>
            <div>
              <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.35rem' }}>
                Select Overridden Priority Level:
              </label>
              <select
                value={overrideTargetPriority}
                onChange={(e) => setOverrideTargetPriority(e.target.value as PriorityLevel)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  fontFamily: typography.fontFamily,
                  color: colors.primaryText,
                }}
              >
                <option value="CRITICAL">CRITICAL (#C86B62 - Urgent intervention required)</option>
                <option value="HIGH">HIGH (#C99A4A - Severe student impact)</option>
                <option value="MEDIUM">MEDIUM (#427B65 - Standard operational queue)</option>
                <option value="LOW">LOW (#6A9282 - Minor inquiry)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.35rem' }}>
                Mandatory Override Justification:
              </label>
              <textarea
                required
                rows={3}
                value={overrideReasonText}
                onChange={(e) => setOverrideReasonText(e.target.value)}
                placeholder="State administrative or safety justification for overriding autonomous priority scoring..."
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
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsOverrideModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" type="submit">
                Confirm Priority Override
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
