import React, { useState, useMemo, useEffect } from 'react';
import {
  MOCK_DEPARTMENTS,
  MOCK_DEPARTMENT_METRICS,
  DepartmentDetailData,
  DepartmentHealthStatus,
} from '../../services/departmentData';
import { adminApiService } from '../../services/adminApiService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { SearchInput } from '../../components/ui/SearchInput';
import { colors, typography, radii, shadows, transitions } from '../../tokens';
import {
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  SlidersHorizontal,
} from '../../components/ui/Icons';

type SortField = 'slaPercentage' | 'resolutionRate' | 'avgResolutionHours' | 'totalGrievances' | 'open';
type SortDirection = 'asc' | 'desc';

export const DepartmentDashboardPage: React.FC = () => {
  // 1. Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('week');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');

  // 2. Sorting State for Comparison & Table
  const [sortField, setSortField] = useState<SortField>('slaPercentage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // 3. Department Detail State (null = show all departments, string = viewing specific dept detail)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  // 4. Feedback Alert State
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Live departments state merged with backend analytics
  const [departmentsList, setDepartmentsList] = useState<DepartmentDetailData[]>(MOCK_DEPARTMENTS);

  useEffect(() => {
    let isMounted = true;
    adminApiService.getDepartmentWorkloads().then((workloads) => {
      if (isMounted && workloads && workloads.length > 0) {
        setDepartmentsList((prev) =>
          prev.map((dept) => {
            const live = workloads.find(
              (w) => w.code.toLowerCase() === dept.code.toLowerCase() || w.id === dept.id
            );
            if (live) {
              return {
                ...dept,
                totalGrievances: live.totalGrievances || dept.totalGrievances,
                open: live.active !== undefined ? live.active : dept.open,
                resolved: live.resolved !== undefined ? live.resolved : dept.resolved,
                slaPercentage: live.slaPercentage !== undefined ? live.slaPercentage : dept.slaPercentage,
                resolutionRate: live.resolutionRate !== undefined ? live.resolutionRate : dept.resolutionRate,
              };
            }
            return dept;
          })
        );
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeDepartment = useMemo(() => {
    if (!selectedDepartmentId) return null;
    return departmentsList.find((d) => d.id === selectedDepartmentId) || null;
  }, [selectedDepartmentId, departmentsList]);

  // Filtering & Sorting Departments
  const filteredDepartments = useMemo(() => {
    return departmentsList.filter((dept) => {
      // Dept filter
      if (selectedDeptFilter !== 'ALL' && dept.id !== selectedDeptFilter) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'ALL' && dept.status !== selectedStatusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = dept.name.toLowerCase().includes(query);
        const matchesCode = dept.code.toLowerCase().includes(query);
        const matchesHead = dept.headName.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesHead) return false;
      }
      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortDirection === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
  }, [selectedDeptFilter, selectedStatusFilter, searchQuery, sortField, sortDirection]);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusBadge = (status: DepartmentHealthStatus) => {
    switch (status) {
      case 'HEALTHY':
        return <Badge variant="success" size="sm">● Healthy</Badge>;
      case 'ATTENTION':
        return <Badge variant="warning" size="sm">▲ Attention</Badge>;
      case 'CRITICAL':
        return <Badge variant="danger" size="sm">✖ Critical</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getSlaColor = (sla: number) => {
    if (sla >= 95) return colors.success;
    if (sla >= 90) return colors.warning;
    return colors.danger;
  };

  // Helper for SVG Trend line in detail view
  const renderTrendSVG = (trends: DepartmentDetailData['trends']) => {
    const width = 580;
    const height = 180;
    const padL = 40;
    const padR = 20;
    const padT = 20;
    const padB = 30;
    const cW = width - padL - padR;
    const cH = height - padT - padB;
    const maxVal = 40;

    const getX = (i: number) => padL + (i / (trends.length - 1)) * cW;
    const getY = (v: number) => padT + cH - (v / maxVal) * cH;

    const incomingPts = trends.map((t, idx) => ({ x: getX(idx), y: getY(t.incoming) }));
    const resolvedPts = trends.map((t, idx) => ({ x: getX(idx), y: getY(t.resolved) }));

    const linePath = (pts: { x: number; y: number }[]) =>
      pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

    const areaPath = (pts: { x: number; y: number }[]) => {
      const line = linePath(pts);
      const lastX = pts[pts.length - 1].x;
      const firstX = pts[0].x;
      const base = padT + cH;
      return `${line} L ${lastX} ${base} L ${firstX} ${base} Z`;
    };

    return (
      <svg width="100%" height="180" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="deptInGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.primaryGreen} stopOpacity="0.25" />
            <stop offset="100%" stopColor={colors.primaryGreen} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Horizontal Lines */}
        {[0, 15, 30].map((lvl) => {
          const y = getY(lvl);
          return (
            <g key={lvl}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke={colors.border} strokeDasharray="3 3" />
              <text x={padL - 8} y={y + 4} fill={colors.secondaryText} fontSize="9" textAnchor="end">
                {lvl}
              </text>
            </g>
          );
        })}
        {/* Area & Lines */}
        <path d={areaPath(incomingPts)} fill="url(#deptInGrad)" />
        <path d={linePath(incomingPts)} fill="none" stroke={colors.primaryGreen} strokeWidth="2.2" />
        <path d={linePath(resolvedPts)} fill="none" stroke={colors.deepForestGreen} strokeWidth="2" strokeDasharray="4 2" />

        {/* Data points */}
        {trends.map((t, idx) => (
          <g key={t.date}>
            <circle cx={incomingPts[idx].x} cy={incomingPts[idx].y} r="3.5" fill={colors.cardSurface} stroke={colors.primaryGreen} strokeWidth="2" />
            <circle cx={resolvedPts[idx].x} cy={resolvedPts[idx].y} r="3" fill={colors.cardSurface} stroke={colors.deepForestGreen} strokeWidth="2" />
            <text x={incomingPts[idx].x} y={height - 8} textAnchor="middle" fill={colors.secondaryText} fontSize="9">
              {t.date}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontFamily: typography.fontFamily }}>
      {/* ---------------------------------------------------------------------- */}
      {/* 1. MAIN PAGE HEADER */}
      {/* ---------------------------------------------------------------------- */}
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
            <Building2 size={24} color={colors.primaryGreen} />
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.deepForestGreen,
                letterSpacing: '-0.02em',
              }}
            >
              Department Dashboard
            </h2>
            <Badge variant="neutral" size="sm">
              8 University Sectors
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
            Monitor grievance volume, SLA performance and resolution efficiency across departments.
          </p>
        </div>

        {/* Header Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {selectedDepartmentId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDepartmentId(null)}
              leftIcon={<ChevronLeft size={15} />}
            >
              All Departments Overview
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFeedbackMessage('Department operational telemetry synced.');
              setTimeout(() => setFeedbackMessage(null), 3000);
            }}
            leftIcon={<RefreshCw size={14} />}
          >
            Sync Telemetry
          </Button>
        </div>
      </div>

      {feedbackMessage && (
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
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 2. TOP METRICS */}
      {/* ---------------------------------------------------------------------- */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Total Departments */}
        <div
          style={{
            backgroundColor: colors.cardSurface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: '1.25rem 1.5rem',
            boxShadow: shadows.card,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: typography.fontSize.sm, color: colors.secondaryText, fontWeight: 500 }}>
              Total Departments
            </span>
            <Building2 size={18} color={colors.primaryGreen} />
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.deepForestGreen, marginBottom: '0.25rem' }}>
            {MOCK_DEPARTMENT_METRICS.totalDepartments}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
            Active campus administrative units
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.primaryGreen }} />
        </div>

        {/* Total Grievances */}
        <div
          style={{
            backgroundColor: colors.cardSurface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: '1.25rem 1.5rem',
            boxShadow: shadows.card,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: typography.fontSize.sm, color: colors.secondaryText, fontWeight: 500 }}>
              Total Grievances
            </span>
            <FileText size={18} color={colors.secondaryGreen} />
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.deepForestGreen, marginBottom: '0.25rem' }}>
            {MOCK_DEPARTMENT_METRICS.totalGrievances.toLocaleString()}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.success, fontWeight: 600 }}>
            ↑ +12.4% historical period intake
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.secondaryGreen }} />
        </div>

        {/* Average Resolution Time */}
        <div
          style={{
            backgroundColor: colors.cardSurface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: '1.25rem 1.5rem',
            boxShadow: shadows.card,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: typography.fontSize.sm, color: colors.secondaryText, fontWeight: 500 }}>
              Average Resolution Time
            </span>
            <Clock size={18} color={colors.warning} />
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.deepForestGreen, marginBottom: '0.25rem' }}>
            {MOCK_DEPARTMENT_METRICS.avgResolutionTime}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
            Across all 8 operational queues
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.warning }} />
        </div>

        {/* Overall SLA % */}
        <div
          style={{
            backgroundColor: colors.cardSurface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: '1.25rem 1.5rem',
            boxShadow: shadows.card,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: typography.fontSize.sm, color: colors.secondaryText, fontWeight: 500 }}>
              Overall SLA %
            </span>
            <CheckCircle2 size={18} color={colors.primaryGreen} />
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.primaryGreen, marginBottom: '0.25rem' }}>
            {MOCK_DEPARTMENT_METRICS.overallSlaPercentage}%
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
            Target: 95.0% institutional benchmark
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.success }} />
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. FILTERS BAR */}
      {/* ---------------------------------------------------------------------- */}
      <Card variant="flat">
        <CardContent style={{ padding: '1rem 1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.85rem',
            }}
          >
            {/* Search Input */}
            <div style={{ minWidth: '240px', flex: '1 1 240px' }}>
              <SearchInput
                placeholder="Search department, code, or officer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* Department Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Dept:</span>
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
                  {MOCK_DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Date:</span>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
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
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="term">Current Academic Term</option>
                  <option value="ytd">Year to Date</option>
                </select>
              </div>

              {/* Status Filter */}
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
                  <option value="HEALTHY">Healthy</option>
                  <option value="ATTENTION">Attention</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {/* Priority Filter */}
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
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(selectedDeptFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDeptFilter('ALL');
                    setSelectedStatusFilter('ALL');
                    setSelectedPriorityFilter('ALL');
                    setSearchQuery('');
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. DEPARTMENT DETAIL VIEW (If a department is selected) */}
      {/* ---------------------------------------------------------------------- */}
      {activeDepartment && (
        <Card variant="default">
          <CardHeader style={{ borderBottom: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedDepartmentId(null)}
                    leftIcon={<ChevronLeft size={14} />}
                  >
                    Back to All
                  </Button>
                  <CardTitle>{activeDepartment.name} Department Detail</CardTitle>
                  <Badge variant="neutral" size="sm">
                    {activeDepartment.code}
                  </Badge>
                  {getStatusBadge(activeDepartment.status)}
                </div>
                <CardDescription>
                  Head: <strong>{activeDepartment.headName}</strong> • {activeDepartment.location} • {activeDepartment.email}
                </CardDescription>
              </div>

              {/* Quick Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Switch Dept:</span>
                <select
                  value={activeDepartment.id}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  style={{
                    fontFamily: typography.fontFamily,
                    fontSize: typography.fontSize.xs,
                    padding: '0.35rem 0.5rem',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                    backgroundColor: colors.cardSurface,
                  }}
                >
                  {MOCK_DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent style={{ padding: '1.5rem' }}>
            {/* Department Detail KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
              {/* Total Grievances */}
              <div style={{ backgroundColor: colors.adminBackground, padding: '1rem', borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Total Grievances</div>
                <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.deepForestGreen, marginTop: '0.25rem' }}>
                  {activeDepartment.totalGrievances.toLocaleString()}
                </div>
              </div>
              {/* Open */}
              <div style={{ backgroundColor: colors.adminBackground, padding: '1rem', borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Open</div>
                <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.warning, marginTop: '0.25rem' }}>
                  {activeDepartment.open}
                </div>
              </div>
              {/* Pending */}
              <div style={{ backgroundColor: colors.adminBackground, padding: '1rem', borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Pending</div>
                <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.secondaryGreen, marginTop: '0.25rem' }}>
                  {activeDepartment.pending}
                </div>
              </div>
              {/* Resolved */}
              <div style={{ backgroundColor: colors.adminBackground, padding: '1rem', borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Resolved</div>
                <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.primaryGreen, marginTop: '0.25rem' }}>
                  {activeDepartment.resolved.toLocaleString()}
                </div>
              </div>
              {/* Escalated */}
              <div style={{ backgroundColor: colors.adminBackground, padding: '1rem', borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Escalated</div>
                <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.danger, marginTop: '0.25rem' }}>
                  {activeDepartment.escalated}
                </div>
              </div>
              {/* SLA % */}
              <div style={{ backgroundColor: colors.adminBackground, padding: '1rem', borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>SLA %</div>
                <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: getSlaColor(activeDepartment.slaPercentage), marginTop: '0.25rem' }}>
                  {activeDepartment.slaPercentage}%
                </div>
              </div>
            </div>

            {/* Department Charts (Grievance Trend, Priority Distribution, Category Distribution) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
              {/* Chart 1: Grievance Trend */}
              <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.1rem', backgroundColor: colors.cardSurface }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 600, fontSize: typography.fontSize.sm, color: colors.deepForestGreen }}>
                    Grievance Trend (7 Days)
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: typography.fontSize.xs }}>
                    <span style={{ color: colors.primaryGreen }}>— Incoming</span>
                    <span style={{ color: colors.deepForestGreen }}>--- Resolved</span>
                  </div>
                </div>
                {renderTrendSVG(activeDepartment.trends)}
              </div>

              {/* Chart 2: Priority Distribution */}
              <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.1rem', backgroundColor: colors.cardSurface }}>
                <div style={{ fontWeight: 600, fontSize: typography.fontSize.sm, color: colors.deepForestGreen, marginBottom: '0.75rem' }}>
                  Priority Distribution
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* Critical */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, marginBottom: '0.2rem' }}>
                      <span style={{ color: colors.danger, fontWeight: 600 }}>Critical</span>
                      <span>{activeDepartment.priorityDistribution.critical} tickets</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                      <div style={{ width: `${(activeDepartment.priorityDistribution.critical / 20) * 100}%`, backgroundColor: colors.danger, height: '100%' }} />
                    </div>
                  </div>
                  {/* High */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, marginBottom: '0.2rem' }}>
                      <span style={{ color: colors.warning, fontWeight: 600 }}>High</span>
                      <span>{activeDepartment.priorityDistribution.high} tickets</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                      <div style={{ width: `${(activeDepartment.priorityDistribution.high / 60) * 100}%`, backgroundColor: colors.warning, height: '100%' }} />
                    </div>
                  </div>
                  {/* Medium */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, marginBottom: '0.2rem' }}>
                      <span style={{ color: colors.primaryGreen, fontWeight: 600 }}>Medium</span>
                      <span>{activeDepartment.priorityDistribution.medium} tickets</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                      <div style={{ width: `${(activeDepartment.priorityDistribution.medium / 150) * 100}%`, backgroundColor: colors.primaryGreen, height: '100%' }} />
                    </div>
                  </div>
                  {/* Low */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, marginBottom: '0.2rem' }}>
                      <span style={{ color: colors.secondaryGreen, fontWeight: 600 }}>Low</span>
                      <span>{activeDepartment.priorityDistribution.low} tickets</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                      <div style={{ width: `${(activeDepartment.priorityDistribution.low / 100) * 100}%`, backgroundColor: colors.secondaryGreen, height: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart 3: Category Distribution */}
              <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.1rem', backgroundColor: colors.cardSurface }}>
                <div style={{ fontWeight: 600, fontSize: typography.fontSize.sm, color: colors.deepForestGreen, marginBottom: '0.75rem' }}>
                  Category Distribution
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeDepartment.categoryDistribution.map((cat) => (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, marginBottom: '0.2rem' }}>
                        <span style={{ color: colors.primaryText, fontWeight: 500 }}>{cat.category}</span>
                        <span style={{ color: colors.secondaryText }}>{cat.percentage}% ({cat.count})</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                        <div style={{ width: `${cat.percentage}%`, backgroundColor: colors.primaryGreen, height: '100%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Grievances in this Department */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: typography.fontSize.md, color: colors.deepForestGreen }}>
                  Recent Grievances in {activeDepartment.name}
                </h4>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
                  Showing {activeDepartment.recentGrievances.length} tickets
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {activeDepartment.recentGrievances.map((grv) => (
                  <div
                    key={grv.id}
                    style={{
                      border: `1px solid ${colors.border}`,
                      borderRadius: radii.md,
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      backgroundColor: colors.cardSurface,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: typography.fontSize.xs,
                          fontWeight: 700,
                          backgroundColor: colors.lightBotanical,
                          color: colors.deepForestGreen,
                          padding: '0.2rem 0.45rem',
                          borderRadius: radii.sm,
                        }}
                      >
                        {grv.ticketNumber}
                      </span>
                      <PriorityBadge level={grv.priority} score={grv.priorityScore} />
                      <Badge variant="neutral" size="sm">
                        {grv.category}
                      </Badge>
                      <span style={{ fontSize: typography.fontSize.sm, fontWeight: 600, color: colors.deepForestGreen }}>
                        {grv.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: typography.fontSize.xs }}>
                      <span style={{ color: colors.secondaryText }}>
                        By {grv.studentName} ({grv.studentId})
                      </span>
                      <span
                        style={{
                          color: grv.slaHealth === 'BREACHED' ? colors.danger : grv.slaHealth === 'AT_RISK' ? colors.warning : colors.success,
                          fontWeight: 600,
                        }}
                      >
                        ⏱ {grv.slaTimeRemaining}
                      </span>
                      <StatusBadge
                        status={grv.status === 'IN_PROGRESS' ? 'warning' : grv.status === 'ESCALATED' ? 'danger' : 'info'}
                        label={grv.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 5. DEPARTMENT PERFORMANCE (VISUAL COMPARISON WITH SORTING) */}
      {/* ---------------------------------------------------------------------- */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <CardTitle>Department Performance Comparison</CardTitle>
              <CardDescription>
                Visual comparative benchmarks for Resolution Rate, SLA Compliance, and Resolution Speed.
              </CardDescription>
            </div>

            {/* Sorting Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>
                Sort Comparison by:
              </span>
              <Button
                variant={sortField === 'slaPercentage' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleSortToggle('slaPercentage')}
                rightIcon={
                  sortField === 'slaPercentage' ? (
                    sortDirection === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                  ) : undefined
                }
              >
                SLA Compliance
              </Button>
              <Button
                variant={sortField === 'resolutionRate' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleSortToggle('resolutionRate')}
                rightIcon={
                  sortField === 'resolutionRate' ? (
                    sortDirection === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                  ) : undefined
                }
              >
                Resolution Rate
              </Button>
              <Button
                variant={sortField === 'avgResolutionHours' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleSortToggle('avgResolutionHours')}
                rightIcon={
                  sortField === 'avgResolutionHours' ? (
                    sortDirection === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                  ) : undefined
                }
              >
                Resolution Time
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {filteredDepartments.map((dept) => (
              <div
                key={dept.id}
                onClick={() => setSelectedDepartmentId(dept.id)}
                style={{
                  border: `1px solid ${selectedDepartmentId === dept.id ? colors.primaryGreen : colors.border}`,
                  backgroundColor: selectedDepartmentId === dept.id ? colors.lightBotanical : colors.cardSurface,
                  borderRadius: radii.md,
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: transitions.fast,
                }}
              >
                {/* Department Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: typography.fontWeight.bold, color: colors.deepForestGreen, fontSize: typography.fontSize.md }}>
                      {dept.name}
                    </span>
                    <span
                      style={{
                        fontSize: typography.fontSize.xs,
                        backgroundColor: colors.lightBotanical,
                        color: colors.primaryGreen,
                        padding: '0.15rem 0.4rem',
                        borderRadius: radii.sm,
                        fontWeight: 700,
                      }}
                    >
                      {dept.code}
                    </span>
                    {getStatusBadge(dept.status)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: typography.fontSize.xs }}>
                    <span style={{ color: colors.secondaryText }}>
                      Queue: <strong>{dept.open} open</strong> ({dept.totalGrievances.toLocaleString()} total)
                    </span>
                    <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />}>
                      Inspect Detail
                    </Button>
                  </div>
                </div>

                {/* 3 Metric Comparison Progress Gauges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {/* 1. Resolution Rate */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, marginBottom: '0.25rem' }}>
                      <span style={{ color: colors.secondaryText }}>Resolution Rate</span>
                      <strong style={{ color: colors.deepForestGreen }}>{dept.resolutionRate}%</strong>
                    </div>
                    <div style={{ height: '7px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                      <div style={{ width: `${dept.resolutionRate}%`, backgroundColor: colors.primaryGreen, height: '100%' }} />
                    </div>
                  </div>

                  {/* 2. SLA Compliance */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, marginBottom: '0.25rem' }}>
                      <span style={{ color: colors.secondaryText }}>SLA Compliance</span>
                      <strong style={{ color: getSlaColor(dept.slaPercentage) }}>{dept.slaPercentage}%</strong>
                    </div>
                    <div style={{ height: '7px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                      <div style={{ width: `${dept.slaPercentage}%`, backgroundColor: getSlaColor(dept.slaPercentage), height: '100%' }} />
                    </div>
                  </div>

                  {/* 3. Average Resolution Time */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, marginBottom: '0.25rem' }}>
                      <span style={{ color: colors.secondaryText }}>Average Resolution Time</span>
                      <strong style={{ color: colors.primaryText }}>{dept.avgResolutionTime}</strong>
                    </div>
                    <div style={{ height: '7px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, (dept.avgResolutionHours / 8) * 100)}%`,
                          backgroundColor: dept.avgResolutionHours > 6 ? colors.danger : dept.avgResolutionHours > 4 ? colors.warning : colors.secondaryGreen,
                          height: '100%',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------------- */}
      {/* 6. DEPARTMENT TABLE */}
      {/* ---------------------------------------------------------------------- */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <CardTitle>Department Operational Table</CardTitle>
              <CardDescription>
                Detailed grievance breakdown across Open, Pending, Resolved, Escalated, Response & SLA metrics.
              </CardDescription>
            </div>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
              Click any department row to view full detail
            </span>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: typography.fontSize.sm }}>
              <thead>
                <tr style={{ backgroundColor: colors.adminBackground, borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.deepForestGreen }}>Department</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Open</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Pending</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Resolved</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Escalated</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>SLA %</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Avg Response</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Avg Resolution</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((dept, idx) => {
                  const isSelected = selectedDepartmentId === dept.id;

                  return (
                    <tr
                      key={dept.id}
                      onClick={() => setSelectedDepartmentId(dept.id)}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        backgroundColor: isSelected ? colors.lightBotanical : idx % 2 === 0 ? colors.cardSurface : colors.adminBackground,
                        cursor: 'pointer',
                        transition: transitions.fast,
                      }}
                    >
                      {/* Department */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: colors.deepForestGreen }}>
                            {dept.name}
                          </span>
                          <span
                            style={{
                              fontSize: typography.fontSize.xs,
                              backgroundColor: colors.lightBotanical,
                              color: colors.primaryGreen,
                              padding: '0.1rem 0.35rem',
                              borderRadius: radii.sm,
                              fontWeight: 700,
                            }}
                          >
                            {dept.code}
                          </span>
                        </div>
                        <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
                          {dept.headName}
                        </div>
                      </td>

                      {/* Open */}
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600, color: colors.warning }}>
                        {dept.open}
                      </td>

                      {/* Pending */}
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', color: colors.secondaryText }}>
                        {dept.pending}
                      </td>

                      {/* Resolved */}
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600, color: colors.primaryGreen }}>
                        {dept.resolved.toLocaleString()}
                      </td>

                      {/* Escalated */}
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600, color: dept.escalated > 0 ? colors.danger : colors.secondaryText }}>
                        {dept.escalated}
                      </td>

                      {/* SLA % */}
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: getSlaColor(dept.slaPercentage),
                            backgroundColor: dept.slaPercentage >= 95 ? '#E7F4EE' : dept.slaPercentage >= 90 ? '#FBF5E9' : '#FAECEB',
                            padding: '0.2rem 0.5rem',
                            borderRadius: radii.sm,
                          }}
                        >
                          {dept.slaPercentage}%
                        </span>
                      </td>

                      {/* Avg Response */}
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', color: colors.primaryText }}>
                        {dept.avgResponseTime}
                      </td>

                      {/* Avg Resolution */}
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 500, color: colors.primaryText }}>
                        {dept.avgResolutionTime}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        {getStatusBadge(dept.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
