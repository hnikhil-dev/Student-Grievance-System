import React, { useState, useMemo, useEffect } from 'react';
import {
  MOCK_CLUSTERS,
  MOCK_CLUSTER_METRICS,
  ClusterDetailItem,
} from '../../services/clusterData';
import { adminApiService } from '../../services/adminApiService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { SearchInput } from '../../components/ui/SearchInput';
import { colors, typography, radii, shadows, transitions } from '../../tokens';
import {
  Network,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Radio,
  Layers,
  Building2,
} from '../../components/ui/Icons';
import { Sparkles, TrendingDown, Minus } from 'lucide-react';

export const ClustersPage: React.FC = () => {
  const [clusters, setClusters] = useState<ClusterDetailItem[]>(MOCK_CLUSTERS);
  const [selectedClusterId, setSelectedClusterId] = useState<string>(MOCK_CLUSTERS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    let mounted = true;
    adminApiService.getClusters().then((data) => {
      if (!mounted) return;
      if (data && Array.isArray(data.clusters) && data.clusters.length > 0) {
        const liveClusters: ClusterDetailItem[] = data.clusters.map((c: any) => ({
          id: c.id,
          name: c.title || c.name || 'Systemic Campus Pattern',
          grievanceCount: c.affected_count || c.grievanceCount || 12,
          growthPercentage: c.growth_rate ? Math.round(c.growth_rate * 100) : 18,
          priority: (c.priority || 'MEDIUM') as any,
          status: 'GROWING_RAPIDLY',
          statusLabel: 'Active Theme',
          trendDirection: 'UP',
          rootCauseSummary: c.root_cause_summary || `Systemic incident pattern correlated across ${c.category || 'campus'} grievances.`,
          topSymptoms: [
            `Repeated reports in ${c.category || 'operational'} sector`,
            `Cross-departmental impact detected`,
            `High blast radius priority elevation`,
          ],
          affectedDepartments: [c.department?.name || c.category || 'Central Administration'],
          relatedCategories: [c.category || 'General Operations'],
          priorityDistribution: {
            critical: Math.max(1, Math.round((c.affected_count || 10) * 0.2)),
            high: Math.max(2, Math.round((c.affected_count || 10) * 0.4)),
            medium: Math.max(2, Math.round((c.affected_count || 10) * 0.3)),
            low: Math.max(1, Math.round((c.affected_count || 10) * 0.1)),
          },
          trendHistory: [
            { date: 'Oct 04', count: Math.max(1, Math.round((c.affected_count || 10) * 0.3)) },
            { date: 'Oct 05', count: Math.max(2, Math.round((c.affected_count || 10) * 0.5)) },
            { date: 'Oct 06', count: Math.max(3, Math.round((c.affected_count || 10) * 0.7)) },
            { date: 'Oct 07', count: Math.max(4, Math.round((c.affected_count || 10) * 0.85)) },
            { date: 'Oct 08', count: c.affected_count || 10 },
          ],
          recentGrievances: [],
        }));

        setClusters((prev) => {
          const liveIds = new Set(liveClusters.map((lc) => lc.id));
          return [...liveClusters, ...prev.filter((p) => !liveIds.has(p.id))];
        });
        if (liveClusters.length > 0) {
          setSelectedClusterId(liveClusters[0].id);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const dynamicMetrics = useMemo(() => {
    return {
      totalClusters: clusters.length,
      activeClusters: clusters.filter((c) => c.status !== 'RESOLVING').length,
      growingClusters: clusters.filter((c) => c.status === 'GROWING_RAPIDLY').length,
      newClusters: clusters.filter((c) => c.status === 'NEW').length,
    };
  }, [clusters]);

  const activeCluster = useMemo(() => {
    return clusters.find((c) => c.id === selectedClusterId) || clusters[0];
  }, [clusters, selectedClusterId]);

  const filteredClusters = useMemo(() => {
    return clusters.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = c.name.toLowerCase().includes(q);
        const mDept = c.affectedDepartments.some((d) => d.toLowerCase().includes(q));
        if (!mName && !mDept) return false;
      }
      return true;
    });
  }, [clusters, statusFilter, searchQuery]);

  // Helper for Cluster Trend SVG
  const renderTrendSVG = (trendHistory: ClusterDetailItem['trendHistory']) => {
    const width = 580;
    const height = 180;
    const padL = 40;
    const padR = 20;
    const padT = 20;
    const padB = 30;
    const cW = width - padL - padR;
    const cH = height - padT - padB;
    const maxVal = 110;

    const getX = (i: number) => padL + (i / (trendHistory.length - 1)) * cW;
    const getY = (v: number) => padT + cH - (v / maxVal) * cH;

    const points = trendHistory.map((t, idx) => ({ x: getX(idx), y: getY(t.count) }));
    const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
    const areaPath = points.length
      ? `${linePath} L ${points[points.length - 1].x} ${padT + cH} L ${points[0].x} ${padT + cH} Z`
      : '';

    return (
      <svg width="100%" height="180" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="clusterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.primaryGreen} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors.primaryGreen} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 50, 100].map((lvl) => {
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
        <path d={areaPath} fill="url(#clusterGrad)" />
        <path d={linePath} fill="none" stroke={colors.primaryGreen} strokeWidth="2.5" />
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={colors.cardSurface} stroke={colors.primaryGreen} strokeWidth="2" />
            <text x={p.x} y={height - 8} textAnchor="middle" fill={colors.secondaryText} fontSize="9">
              {trendHistory[idx].date}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const getStatusBadge = (status: ClusterDetailItem['status']) => {
    switch (status) {
      case 'GROWING_RAPIDLY':
        return (
          <Badge variant="danger" size="sm">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <TrendingUp size={11} /> Growing Rapidly
            </span>
          </Badge>
        );
      case 'RESOLVING':
        return (
          <Badge variant="success" size="sm">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <TrendingDown size={11} /> Resolving
            </span>
          </Badge>
        );
      case 'NEW':
        return (
          <Badge variant="warning" size="sm">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Sparkles size={11} /> New Cluster
            </span>
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Minus size={11} /> Stable
            </span>
          </Badge>
        );
    }
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
            <Network size={24} color={colors.primaryGreen} />
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.deepForestGreen,
                letterSpacing: '-0.02em',
              }}
            >
              Issue Clustering & Systemic Patterns
            </h2>
            <Badge variant="info" size="sm">
              Semantic Theme Engine
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
            Identify recurring grievance themes, root cause patterns, and fast-growing systemic issues across campus sectors.
          </p>
        </div>
      </div>

      {/* 2. Top Metrics */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Total Clusters</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.deepForestGreen, margin: '0.25rem 0' }}>
            {dynamicMetrics.totalClusters}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Identified theme categories</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.primaryGreen }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Active Clusters</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.primaryGreen, margin: '0.25rem 0' }}>
            {dynamicMetrics.activeClusters}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Ongoing student reports</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.secondaryGreen }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.danger, fontWeight: 600 }}>Growing Clusters</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.danger, margin: '0.25rem 0' }}>
            {dynamicMetrics.growingClusters}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.danger }}>+20% weekly escalation</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.danger }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.warning, fontWeight: 600 }}>New Clusters</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.warning, margin: '0.25rem 0' }}>
            {dynamicMetrics.newClusters}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.warning }}>Emerged in past 48h</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.warning }} />
        </div>
      </section>

      {/* 3. Visual Comparison Bar Chart (All Clusters Volume) */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Systemic Theme Volume Comparison</CardTitle>
          <CardDescription>Relative grievance concentration across top operational clusters</CardDescription>
        </CardHeader>
        <CardContent style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {clusters.map((c) => {
              const maxVol = 450;
              const barPercent = Math.min(100, (c.grievanceCount / maxVol) * 100);
              const isSelected = c.id === selectedClusterId;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClusterId(c.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '0.5rem 0.75rem',
                    borderRadius: radii.md,
                    backgroundColor: isSelected ? colors.lightBotanical : 'transparent',
                    border: `1px solid ${isSelected ? colors.secondaryGreen : 'transparent'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', fontSize: typography.fontSize.xs }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: colors.deepForestGreen }}>{c.name}</span>
                      {getStatusBadge(c.status)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: colors.primaryText }}>{c.grievanceCount} complaints</span>
                      <span style={{ color: c.growthPercentage > 0 ? colors.danger : colors.success, fontWeight: 600 }}>
                        {c.growthPercentage > 0 ? `+${c.growthPercentage}%` : `${c.growthPercentage}%`} this week
                      </span>
                    </div>
                  </div>
                  <div style={{ height: '8px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${barPercent}%`,
                        backgroundColor: c.status === 'GROWING_RAPIDLY' ? colors.danger : colors.primaryGreen,
                        height: '100%',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Split View: Cluster List & In-Depth Cluster Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Cluster List */}
        <Card variant="default">
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle>Cluster Library</CardTitle>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  fontSize: typography.fontSize.xs,
                  padding: '0.3rem 0.5rem',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="GROWING_RAPIDLY">Growing</option>
                <option value="STABLE">Stable</option>
                <option value="RESOLVING">Resolving</option>
                <option value="NEW">New</option>
              </select>
            </div>
          </CardHeader>
          <CardContent style={{ padding: '0 1rem 1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {filteredClusters.map((c) => {
                const isSelected = c.id === selectedClusterId;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClusterId(c.id)}
                    style={{
                      border: `1px solid ${isSelected ? colors.primaryGreen : colors.border}`,
                      backgroundColor: isSelected ? colors.lightBotanical : colors.cardSurface,
                      borderRadius: radii.md,
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      transition: transitions.fast,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, color: colors.deepForestGreen, fontSize: typography.fontSize.sm }}>
                        {c.name}
                      </span>
                      <PriorityBadge level={c.priority} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
                      <span>{c.grievanceCount} total complaints</span>
                      <span>{c.statusLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right: In-Depth Cluster Detail */}
        {activeCluster && (
          <Card variant="default">
            <CardHeader style={{ borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <CardTitle>{activeCluster.name}</CardTitle>
                    {getStatusBadge(activeCluster.status)}
                  </div>
                  <CardDescription>
                    Affects: <strong>{activeCluster.affectedDepartments.join(', ')}</strong> • Related: {activeCluster.relatedCategories.join(', ')}
                  </CardDescription>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, color: colors.deepForestGreen }}>
                    {activeCluster.grievanceCount}
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: activeCluster.growthPercentage > 0 ? colors.danger : colors.success, fontWeight: 600 }}>
                    {activeCluster.growthPercentage > 0 ? `+${activeCluster.growthPercentage}%` : `${activeCluster.growthPercentage}%`} this week
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '1.25rem' }}>
              {/* Root Cause Summary */}
              <div style={{ backgroundColor: colors.adminBackground, border: `1px solid ${colors.border}`, padding: '0.85rem', borderRadius: radii.md, marginBottom: '1.25rem' }}>
                <div style={{ fontSize: typography.fontSize.xs, fontWeight: 700, color: colors.deepForestGreen, marginBottom: '0.25rem' }}>
                  Systemic Root Cause Hypothesis:
                </div>
                <p style={{ margin: 0, fontSize: typography.fontSize.sm, color: colors.primaryText, lineHeight: 1.45 }}>
                  {activeCluster.rootCauseSummary}
                </p>
              </div>

              {/* 7-Day Trend Line SVG */}
              <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1rem', backgroundColor: colors.cardSurface, marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 600, fontSize: typography.fontSize.xs, color: colors.deepForestGreen, marginBottom: '0.5rem' }}>
                  7-Day Grievance Accumulation Trajectory
                </div>
                {renderTrendSVG(activeCluster.trendHistory)}
              </div>

              {/* Top Symptoms */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 600, fontSize: typography.fontSize.xs, color: colors.deepForestGreen, marginBottom: '0.4rem' }}>
                  Top Student Symptoms & Error Reports:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: typography.fontSize.xs, color: colors.secondaryText, lineHeight: 1.6 }}>
                  {activeCluster.topSymptoms.map((sym, i) => (
                    <li key={i}>{sym}</li>
                  ))}
                </ul>
              </div>

              {/* Priority Distribution */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 600, fontSize: typography.fontSize.xs, color: colors.deepForestGreen, marginBottom: '0.4rem' }}>
                  Priority Breakdown within Cluster:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '0.5rem', textAlign: 'center' }}>
                  <div style={{ backgroundColor: '#FAECEB', padding: '0.5rem', borderRadius: radii.sm, border: '1px solid #ECC7C4' }}>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.danger }}>Critical</div>
                    <div style={{ fontWeight: 700, color: colors.danger }}>{activeCluster.priorityDistribution.critical}</div>
                  </div>
                  <div style={{ backgroundColor: '#FBF5E9', padding: '0.5rem', borderRadius: radii.sm, border: '1px solid #EEDBB9' }}>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.warning }}>High</div>
                    <div style={{ fontWeight: 700, color: colors.warning }}>{activeCluster.priorityDistribution.high}</div>
                  </div>
                  <div style={{ backgroundColor: '#E7F4EE', padding: '0.5rem', borderRadius: radii.sm, border: '1px solid #C4E3D5' }}>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.primaryGreen }}>Medium</div>
                    <div style={{ fontWeight: 700, color: colors.primaryGreen }}>{activeCluster.priorityDistribution.medium}</div>
                  </div>
                  <div style={{ backgroundColor: colors.adminBackground, padding: '0.5rem', borderRadius: radii.sm, border: `1px solid ${colors.border}` }}>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Low</div>
                    <div style={{ fontWeight: 700, color: colors.secondaryText }}>{activeCluster.priorityDistribution.low}</div>
                  </div>
                </div>
              </div>

              {/* Recent Grievances in this Cluster */}
              <div>
                <div style={{ fontWeight: 600, fontSize: typography.fontSize.xs, color: colors.deepForestGreen, marginBottom: '0.4rem' }}>
                  Recent Linked Grievances:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {activeCluster.recentGrievances.map((rg) => (
                    <div
                      key={rg.id}
                      style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radii.sm,
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: typography.fontSize.xs,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: colors.deepForestGreen }}>{rg.ticketNumber}</span>
                        <span style={{ color: colors.primaryText, fontWeight: 500 }}>{rg.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PriorityBadge level={rg.priority} />
                        <span style={{ color: colors.secondaryText }}>{rg.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
