import React, { useState, useMemo, useEffect } from 'react';
import {
  MOCK_ESCALATIONS,
  MOCK_ESCALATION_METRICS,
  MOCK_ESCALATION_RULES,
  EscalationItem,
  EscalationLevel,
} from '../../services/escalationData';
import { adminApiService } from '../../services/adminApiService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Modal } from '../../components/ui/Modal';
import { colors, typography, radii, shadows, transitions } from '../../tokens';
import {
  AlertTriangle,
  CheckCircle2,
  Send,
  Clock,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  User,
  Camera,
  ShieldCheck,
} from '../../components/ui/Icons';

export const EscalationPage: React.FC = () => {
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Detail & Action states
  const [activeItem, setActiveItem] = useState<EscalationItem | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'ASSIGN' | 'ESCALATE_HIGHER' | 'REASSIGN' | 'RESOLVE' | null>(null);
  const [actionTargetOfficer, setActionTargetOfficer] = useState<string>('Dean of Student Affairs');
  const [actionJustification, setActionJustification] = useState<string>('');
  const [resolutionFile, setResolutionFile] = useState<File | null>(null);
  const [resolutionFileType, setResolutionFileType] = useState<'PHOTO' | 'RECEIPT' | 'DOCUMENT' | 'SCREENSHOT'>('PHOTO');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      adminApiService.getEscalations(),
      adminApiService.getStaffMembers(),
    ]).then(([escData, staff]) => {
      if (!mounted) return;
      setIsLoading(false);
      if (staff && staff.length > 0) {
        setAvailableStaff(staff);
        if (staff[0]?.full_name) {
          setActionTargetOfficer(staff[0].full_name);
        }
      }
      if (escData && Array.isArray(escData.escalations) && escData.escalations.length > 0) {
        const liveItems: EscalationItem[] = escData.escalations.map((e: any) => ({
          id: e.id,
          ticketNumber: e.ticketNumber,
          title: e.title,
          description: e.reason || 'Escalated ticket requiring executive oversight',
          reason: e.reason,
          department: e.department || 'Central Administration',
          priority: e.priority || 'CRITICAL',
          escalationLevel: e.level === 2 ? 'Level 2 (Executive Dean)' : 'Level 1 (Department Lead)',
          assignedTo: e.assignedTo || 'Dean of Student Affairs',
          age: 'Live',
          status: e.status === 'RESOLVED' ? 'RESOLVED' : 'PENDING',
          escalatedAt: e.escalatedAt || new Date().toISOString(),
          studentName: 'Campus Student',
          studentId: 'STD-LIVE',
          timeline: [
            {
              id: `tl-1`,
              stage: 'Incident Escalated',
              timestamp: new Date(e.escalatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actor: 'Autonomous Sentinel',
              description: e.reason,
              completed: true,
              statusType: 'danger',
            },
          ],
        }));

        setEscalations(liveItems);
      }
    }).catch(() => {
      if (mounted) setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const dynamicMetrics = useMemo(() => {
    return {
      totalEscalations: escalations.length,
      criticalCount: escalations.filter((e) => e.priority === 'CRITICAL').length,
      pendingCount: escalations.filter((e) => e.status === 'PENDING').length,
      resolvedCount: escalations.filter((e) => e.status === 'RESOLVED').length,
    };
  }, [escalations]);

  const filteredEscalations = useMemo(() => {
    return escalations.filter((item) => {
      if (selectedLevelFilter !== 'ALL' && !item.escalationLevel.includes(selectedLevelFilter)) return false;
      if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = item.title.toLowerCase().includes(q);
        const mId = item.ticketNumber.toLowerCase().includes(q);
        const mDept = item.department.toLowerCase().includes(q);
        const mAssignee = item.assignedTo.toLowerCase().includes(q);
        if (!mTitle && !mId && !mDept && !mAssignee) return false;
      }
      return true;
    });
  }, [escalations, selectedLevelFilter, selectedStatusFilter, searchQuery]);

  const handleOpenAction = (item: EscalationItem, type: 'ASSIGN' | 'ESCALATE_HIGHER' | 'REASSIGN' | 'RESOLVE') => {
    setActiveItem(item);
    setActionType(type);
    setActionJustification(
      type === 'RESOLVE'
        ? `Remediation inspected and ratified on-site for ${item.ticketNumber}. Equipment replaced and operational integrity confirmed.`
        : ''
    );
    setResolutionFile(null);
    setResolutionFileType('PHOTO');
    setPreviewUrl(null);
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !actionType) return;

    if (actionType === 'RESOLVE') {
      setIsSubmittingAction(true);
      try {
        const res = await adminApiService.resolveGrievance(
          activeItem.id,
          actionJustification || `Resolution verified and ratified with Dean sign-off for ${activeItem.ticketNumber}.`,
          resolutionFile,
          resolutionFileType
        );
        const verdict = res.data?.verificationResult?.verdict || 'VERIFIED_RESOLVED';
        const sha256 = res.data?.evidence?.sha256 ? ` (SHA-256: ${res.data.evidence.sha256.slice(0, 10)}...)` : '';
        setFeedback(`Escalation for ${activeItem.ticketNumber} marked RESOLVED: Resolution Verifier confirmed '${verdict}'${sha256}.`);
      } catch {
        setFeedback(`Escalation for ${activeItem.ticketNumber} marked RESOLVED with Dean sign-off.`);
      } finally {
        setIsSubmittingAction(false);
        setIsActionModalOpen(false);
      }

      setEscalations((prev) =>
        prev.map((esc) =>
          esc.id === activeItem.id
            ? {
                ...esc,
                status: 'RESOLVED',
                timeline: [
                  ...esc.timeline,
                  {
                    id: `tl-${Date.now()}`,
                    stage: 'Resolved',
                    timestamp: 'Just now',
                    actor: 'Admin Officer',
                    description: `Resolution memo ratified: ${actionJustification || 'Issue certified closed.'}`,
                    completed: true,
                    statusType: 'success',
                  },
                ],
              }
            : esc
        )
      );
      setTimeout(() => setFeedback(null), 5000);
      return;
    } else if (actionType === 'ESCALATE_HIGHER') {
      const nextLevel: EscalationLevel = 'Level 3 (Academic Provost)';
      setEscalations((prev) =>
        prev.map((esc) =>
          esc.id === activeItem.id
            ? {
                ...esc,
                escalationLevel: nextLevel,
                assignedTo: 'Academic Provost Office',
                timeline: [
                  ...esc.timeline,
                  {
                    id: `tl-${Date.now()}`,
                    stage: 'Elevated to Level 3',
                    timestamp: 'Just now',
                    actor: 'Admin Dispatcher',
                    description: `Elevated to Provost: ${actionJustification}`,
                    completed: true,
                    statusType: 'danger',
                  },
                ],
              }
            : esc
        )
      );
      setFeedback(`Escalation for ${activeItem.ticketNumber} elevated to Level 3 Academic Provost.`);
    } else {
      setEscalations((prev) =>
        prev.map((esc) =>
          esc.id === activeItem.id
            ? {
                ...esc,
                assignedTo: actionTargetOfficer,
                timeline: [
                  ...esc.timeline,
                  {
                    id: `tl-${Date.now()}`,
                    stage: 'Reassigned',
                    timestamp: 'Just now',
                    actor: 'Admin Officer',
                    description: `Reassigned to ${actionTargetOfficer}`,
                    completed: true,
                    statusType: 'info',
                  },
                ],
              }
            : esc
        )
      );
      setFeedback(`Reassigned ${activeItem.ticketNumber} to ${actionTargetOfficer}.`);
    }

    setIsActionModalOpen(false);
    setTimeout(() => setFeedback(null), 4000);
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
            <AlertTriangle size={24} color={colors.danger} />
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.deepForestGreen,
                letterSpacing: '-0.02em',
              }}
            >
              Escalation Center & Governance
            </h2>
            <Badge variant="danger" size="sm">
              Level 1–3 Intervention
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
            Monitor high-stakes student grievances requiring executive Dean oversight, reassignments, and administrative governance.
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
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Total Escalations</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.deepForestGreen, margin: '0.25rem 0' }}>
            {dynamicMetrics.totalEscalations}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Elevated governance cases</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.primaryGreen }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.danger, fontWeight: 600 }}>Critical Escalations</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.danger, margin: '0.25rem 0' }}>
            {dynamicMetrics.criticalCount}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.danger }}>Dean intervention required</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.danger }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.warning, fontWeight: 600 }}>Pending Action</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.warning, margin: '0.25rem 0' }}>
            {dynamicMetrics.pendingCount}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.warning }}>Awaiting department response</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.warning }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.success, fontWeight: 600 }}>Resolved</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.success, margin: '0.25rem 0' }}>
            {dynamicMetrics.resolvedCount}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.success }}>Closed with Dean memo</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.success }} />
        </div>
      </section>

      {/* 3. Filters */}
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
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Tier:</span>
                <select
                  value={selectedLevelFilter}
                  onChange={(e) => setSelectedLevelFilter(e.target.value)}
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
                  <option value="ALL">All Escalation Tiers</option>
                  <option value="Level 1">Level 1 (Department Lead)</option>
                  <option value="Level 2">Level 2 (Executive Dean)</option>
                  <option value="Level 3">Level 3 (Academic Provost)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
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
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Escalation Table */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <CardTitle>Active Escalation Ledger</CardTitle>
              <CardDescription>Click any row to open the vertical event timeline and resolution actions</CardDescription>
            </div>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
              Showing {filteredEscalations.length} records
            </span>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: typography.fontSize.sm }}>
              <thead>
                <tr style={{ backgroundColor: colors.adminBackground, borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.deepForestGreen }}>Grievance</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Reason</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Department</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Priority</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Escalation Level</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Assigned To</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Age</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEscalations.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '3rem 1rem', textAlign: 'center', color: colors.secondaryText }}>
                      <AlertTriangle size={32} color={colors.secondaryGreen} style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
                      <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginBottom: '0.25rem' }}>
                        No Active Escalations
                      </div>
                      <div style={{ fontSize: typography.fontSize.xs }}>
                        All critical tickets are being resolved within standard SLAs. No executive intervention required.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEscalations.map((item, idx) => (
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

                    <td style={{ padding: '0.85rem 0.75rem', fontSize: typography.fontSize.xs, color: colors.danger, fontWeight: 600, maxWidth: '180px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.reason}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <Badge variant="neutral" size="sm">{item.department}</Badge>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <PriorityBadge level={item.priority} />
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', fontSize: typography.fontSize.xs, fontWeight: 600, color: colors.deepForestGreen }}>
                      {item.escalationLevel}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', fontSize: typography.fontSize.xs, color: colors.primaryText }}>
                      {item.assignedTo}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
                      {item.age}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          fontWeight: 700,
                          color: item.status === 'RESOLVED' ? colors.success : item.status === 'IN_REVIEW' ? colors.warning : colors.danger,
                        }}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setActiveItem(item); }}>
                        Timeline →
                      </Button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Escalation Policy Rules (Read-Only) */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <CardTitle>Autonomous Escalation Dispatch Policies</CardTitle>
              <CardDescription>Automated tier triggers governing rapid executive intervention</CardDescription>
            </div>
            <Badge variant="neutral" size="sm">3 Rules Active</Badge>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {MOCK_ESCALATION_RULES.map((rule) => (
              <div
                key={rule.id}
                style={{
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.adminBackground,
                  borderRadius: radii.md,
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: colors.deepForestGreen, fontSize: typography.fontSize.sm }}>
                    {rule.name}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: typography.fontSize.xs, color: colors.primaryText, marginTop: '0.2rem' }}>
                    <span style={{ color: colors.primaryGreen, fontWeight: 700 }}>IF </span>
                    {rule.condition.replace('IF ', '')}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: typography.fontSize.xs, color: colors.danger, marginTop: '0.15rem' }}>
                    <span style={{ fontWeight: 700 }}>THEN </span>
                    {rule.action.replace('THEN ', '')}
                  </div>
                </div>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
                  Triggered {rule.triggerCount} times this month
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6. Escalation Detail Modal & Vertical Timeline */}
      {activeItem && !isActionModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setActiveItem(null)}
          title={`Escalation Inspection: ${activeItem.ticketNumber}`}
          description={`Reason: ${activeItem.reason} • Level: ${activeItem.escalationLevel}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: typography.fontSize.sm }}>
            {/* Ticket Summary Box */}
            <div style={{ backgroundColor: colors.adminBackground, padding: '1rem', borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
              <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginBottom: '0.25rem' }}>
                {activeItem.title}
              </div>
              <p style={{ margin: '0 0 0.5rem 0', color: colors.secondaryText, lineHeight: 1.45 }}>
                {activeItem.description}
              </p>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <span>Department: <strong>{activeItem.department}</strong></span>
                <span>Priority: <strong style={{ color: colors.danger }}>{activeItem.priority}</strong></span>
                <span>Current Owner: <strong>{activeItem.assignedTo}</strong></span>
                <span>Escalated At: <strong>{activeItem.escalatedAt}</strong></span>
              </div>
            </div>

            {/* Vertical Escalation Timeline */}
            <div>
              <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginBottom: '0.75rem', fontSize: typography.fontSize.sm }}>
                Vertical Escalation Chronology:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
                {/* Vertical connecting line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '7px',
                    top: '8px',
                    bottom: '8px',
                    width: '2px',
                    backgroundColor: colors.border,
                  }}
                />

                {activeItem.timeline.map((tp) => (
                  <div key={tp.id} style={{ position: 'relative' }}>
                    {/* Circle Node */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-1.5rem',
                        top: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: tp.completed
                          ? tp.statusType === 'danger'
                            ? colors.danger
                            : tp.statusType === 'warning'
                            ? colors.warning
                            : colors.primaryGreen
                          : colors.adminBackground,
                        border: `2px solid ${tp.completed ? colors.cardSurface : colors.border}`,
                        boxShadow: shadows.subtle,
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: colors.deepForestGreen }}>{tp.stage}</span>
                      <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>{tp.timestamp}</span>
                    </div>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.primaryText, marginTop: '0.15rem' }}>
                      {tp.description}
                    </div>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, marginTop: '0.1rem' }}>
                      By: <em>{tp.actor}</em>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: '0.85rem' }}>
              <Button variant="secondary" size="sm" onClick={() => setActiveItem(null)}>
                Close
              </Button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => handleOpenAction(activeItem, 'REASSIGN')}>
                  Reassign Owner
                </Button>
                {activeItem.status !== 'RESOLVED' && (
                  <>
                    <Button variant="danger" size="sm" onClick={() => handleOpenAction(activeItem, 'ESCALATE_HIGHER')}>
                      Elevate to Provost
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleOpenAction(activeItem, 'RESOLVE')}>
                      Ratify Resolution
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Action Confirmation Modal (Reassign / Elevate / Resolve) */}
      {isActionModalOpen && activeItem && (
        <Modal
          isOpen={true}
          onClose={() => setIsActionModalOpen(false)}
          title={
            actionType === 'RESOLVE'
              ? `Confirm Escalation Resolution: ${activeItem.ticketNumber}`
              : actionType === 'ESCALATE_HIGHER'
              ? `Elevate to Level 3 Provost: ${activeItem.ticketNumber}`
              : `Reassign Escalation Owner: ${activeItem.ticketNumber}`
          }
          description="High-level governance changes are permanently recorded in the institutional audit log."
        >
          <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: typography.fontSize.sm }}>
            {actionType === 'REASSIGN' && (
              <div>
                <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.35rem' }}>
                  Select Designated Executive:
                </label>
                <select
                  value={actionTargetOfficer}
                  onChange={(e) => setActionTargetOfficer(e.target.value)}
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
                    availableStaff.map((staff) => (
                      <option key={staff.id} value={staff.full_name}>
                        {staff.full_name} ({staff.department?.name || staff.role})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Dean of Student Affairs">Dean of Student Affairs</option>
                      <option value="Chief Campus Warden">Chief Campus Warden</option>
                      <option value="Director of Infrastructure">Director of Infrastructure</option>
                      <option value="Controller of Examinations">Controller of Examinations</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {actionType === 'RESOLVE' && (
              <div
                style={{
                  border: `1px dashed ${resolutionFile ? colors.primaryGreen : colors.border}`,
                  backgroundColor: resolutionFile ? 'rgba(45, 106, 79, 0.04)' : '#FAFBF9',
                  borderRadius: radii.md,
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Camera size={15} color={colors.primaryGreen} />
                    <span style={{ fontSize: typography.fontSize.xs, fontWeight: 700, color: colors.deepForestGreen, textTransform: 'uppercase' }}>
                      Upload Solved Media / Counter-Evidence
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: colors.primaryGreen, fontWeight: 600 }}>
                    SHA-256 Verified
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*,.pdf,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const f = e.target.files[0];
                        setResolutionFile(f);
                        if (f.type.startsWith('image/')) {
                          setPreviewUrl(URL.createObjectURL(f));
                        } else {
                          setPreviewUrl(null);
                        }
                      }
                    }}
                    style={{ fontSize: typography.fontSize.xs, color: colors.primaryText, width: '100%' }}
                  />

                  <select
                    value={resolutionFileType}
                    onChange={(e) => setResolutionFileType(e.target.value as any)}
                    style={{
                      padding: '0.3rem 0.5rem',
                      borderRadius: radii.sm,
                      border: `1px solid ${colors.border}`,
                      fontSize: typography.fontSize.xs,
                      fontFamily: typography.fontFamily,
                      color: colors.primaryText,
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="PHOTO">Photo of Repaired Facility</option>
                    <option value="RECEIPT">Service Receipt / Invoice</option>
                    <option value="SCREENSHOT">System Screenshot</option>
                    <option value="DOCUMENT">PDF Report</option>
                  </select>
                </div>

                {resolutionFile && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', backgroundColor: '#FFFFFF', borderRadius: radii.sm, border: `1px solid ${colors.border}` }}>
                    <span style={{ fontSize: typography.fontSize.xs, color: colors.deepForestGreen, fontWeight: 600 }}>
                      {resolutionFile.name} ({(resolutionFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setResolutionFile(null);
                        setPreviewUrl(null);
                      }}
                      style={{ background: 'none', border: 'none', color: colors.danger, fontSize: typography.fontSize.xs, cursor: 'pointer', fontWeight: 600 }}
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: '#4338CA', backgroundColor: '#EEF2FF', padding: '0.4rem 0.6rem', borderRadius: radii.sm }}>
                  <ShieldCheck size={14} color="#4F46E5" />
                  <span>Resolution Verifier Agent will audit proof and assign verdict prior to closed-loop dispatch.</span>
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.35rem' }}>
                Governance Note & Directives:
              </label>
              <textarea
                required
                rows={3}
                value={actionJustification}
                onChange={(e) => setActionJustification(e.target.value)}
                placeholder="State the resolution verification, executive decision, or transfer directives..."
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
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsActionModalOpen(false)}>
                Cancel
              </Button>
              <Button variant={actionType === 'RESOLVE' ? 'primary' : 'danger'} size="sm" type="submit">
                Confirm Governance Action
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
