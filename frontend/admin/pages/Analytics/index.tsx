import React, { useState } from 'react';
import {
  MOCK_ANALYTICS_OBSERVATIONS,
  MOCK_VOLUME_TIMELINE,
  MOCK_DEPARTMENT_PERF,
  MOCK_TOP_CATEGORIES,
  MOCK_AI_ANALYTICS,
  MOCK_ESCALATION_ANALYTICS,
} from '../../services/analyticsData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, radii, shadows, transitions } from '../../tokens';
import {
  BarChart3,
  Download,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  Building2,
} from '../../components/ui/Icons';

export const AnalyticsPage: React.FC = () => {
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('30d');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const handleExport = () => {
    setExportFeedback('Exporting institutional report PDF & CSV telemetry...');
    setTimeout(() => {
      setExportFeedback('Institutional report successfully compiled and downloaded (PDF/CSV).');
      setTimeout(() => setExportFeedback(null), 4000);
    }, 1200);
  };

  // SVG Area generator for 6-week timeline
  const renderVolumeTrend = () => {
    const width = 640;
    const height = 200;
    const padL = 40;
    const padR = 20;
    const padT = 20;
    const padB = 30;
    const cW = width - padL - padR;
    const cH = height - padT - padB;
    const maxVal = 500;

    const getX = (i: number) => padL + (i / (MOCK_VOLUME_TIMELINE.length - 1)) * cW;
    const getY = (v: number) => padT + cH - (v / maxVal) * cH;

    const incomingPts = MOCK_VOLUME_TIMELINE.map((t, i) => ({ x: getX(i), y: getY(t.incoming) }));
    const resolvedPts = MOCK_VOLUME_TIMELINE.map((t, i) => ({ x: getX(i), y: getY(t.resolved) }));

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
      <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="anVolGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.primaryGreen} stopOpacity="0.25" />
            <stop offset="100%" stopColor={colors.primaryGreen} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0, 250, 500].map((lvl) => {
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
        <path d={areaPath(incomingPts)} fill="url(#anVolGrad)" />
        <path d={linePath(incomingPts)} fill="none" stroke={colors.primaryGreen} strokeWidth="2.5" />
        <path d={linePath(resolvedPts)} fill="none" stroke={colors.deepForestGreen} strokeWidth="2" strokeDasharray="4 2" />
        {incomingPts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={colors.cardSurface} stroke={colors.primaryGreen} strokeWidth="2" />
            <circle cx={resolvedPts[i].x} cy={resolvedPts[i].y} r="3" fill={colors.cardSurface} stroke={colors.deepForestGreen} strokeWidth="2" />
            <text x={p.x} y={height - 8} textAnchor="middle" fill={colors.secondaryText} fontSize="9">
              {MOCK_VOLUME_TIMELINE[i].period}
            </text>
          </g>
        ))}
      </svg>
    );
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
            <BarChart3 size={24} color={colors.primaryGreen} />
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.deepForestGreen,
                letterSpacing: '-0.02em',
              }}
            >
              Institutional Analytics & Historical Intelligence
            </h2>
            <Badge variant="info" size="sm">
              Longitudinal Analysis
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
            Retrospective patterns, multi-term resolution benchmarks, department velocity, and AI categorization accuracy.
          </p>
        </div>

        {/* Action: Export Report */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Button variant="primary" size="sm" onClick={handleExport} leftIcon={<Download size={14} />}>
            Export Executive Report
          </Button>
        </div>
      </div>

      {exportFeedback && (
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
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* 2. Top Summary Observations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {MOCK_ANALYTICS_OBSERVATIONS.map((obs) => (
          <div
            key={obs.id}
            style={{
              backgroundColor: colors.cardSurface,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              padding: '1rem',
              boxShadow: shadows.subtle,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span
                style={{
                  fontSize: typography.fontSize.xs,
                  fontWeight: 700,
                  color: obs.type === 'risk' ? colors.danger : obs.type === 'improvement' ? colors.success : colors.primaryGreen,
                  backgroundColor: obs.type === 'risk' ? '#FAECEB' : obs.type === 'improvement' ? '#E7F4EE' : colors.lightBotanical,
                  padding: '0.15rem 0.45rem',
                  borderRadius: radii.sm,
                }}
              >
                {obs.metric}
              </span>
              <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Key Insight</span>
            </div>
            <p style={{ margin: 0, fontSize: typography.fontSize.xs, color: colors.primaryText, lineHeight: 1.45 }}>
              {obs.text}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Filter Bar */}
      <Card variant="flat">
        <CardContent style={{ padding: '0.75rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            {/* Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Timeframe:</span>
              {(['today', '7d', '30d', '90d', 'custom'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSelectedDatePreset(preset)}
                  style={{
                    backgroundColor: selectedDatePreset === preset ? colors.primaryGreen : colors.cardSurface,
                    color: selectedDatePreset === preset ? colors.cardSurface : colors.primaryText,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.sm,
                    padding: '0.3rem 0.65rem',
                    fontSize: typography.fontSize.xs,
                    fontWeight: selectedDatePreset === preset ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {preset.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Department Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Sector:</span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.fontSize.xs,
                  padding: '0.35rem 0.65rem',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                  backgroundColor: colors.cardSurface,
                }}
              >
                <option value="ALL">All Campus Sectors</option>
                <option value="Technical">Technical</option>
                <option value="Academic">Academic</option>
                <option value="Hostel">Hostel</option>
                <option value="Accounts">Accounts</option>
                <option value="Support">Support</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Section 1 & 2: Grievance Volume Trend & Resolution Velocity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Section 1: Grievance Volume Trend */}
        <Card variant="default">
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle>Grievance Intake vs Resolution Curve</CardTitle>
                <CardDescription>6-Week longitudinal intake comparison</CardDescription>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: typography.fontSize.xs }}>
                <span style={{ color: colors.primaryGreen }}>— Incoming</span>
                <span style={{ color: colors.deepForestGreen }}>--- Resolved</span>
              </div>
            </div>
          </CardHeader>
          <CardContent style={{ padding: '0 1.25rem 1.25rem' }}>
            {renderVolumeTrend()}
          </CardContent>
        </Card>

        {/* Section 2: Resolution Performance Velocity */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Department Resolution Velocity</CardTitle>
            <CardDescription>First response vs full resolution turnaround (hours)</CardDescription>
          </CardHeader>
          <CardContent style={{ padding: '0 1.25rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MOCK_DEPARTMENT_PERF.slice(0, 5).map((dp) => (
                <div key={dp.department} style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: typography.fontSize.xs, marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: colors.deepForestGreen }}>{dp.department}</span>
                    <span style={{ color: colors.secondaryText }}>
                      Resp: <strong>{dp.avgResponseHours}h</strong> • Resol: <strong>{dp.avgResolutionHours}h</strong>
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                    <div style={{ width: `${(dp.avgResolutionHours / 8) * 100}%`, backgroundColor: dp.avgResolutionHours > 6 ? colors.danger : colors.primaryGreen, height: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Section 3 & 4: SLA Compliance Benchmarks & Category Concentration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Section 3: SLA Performance by Department */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>SLA Compliance Ranking by Department</CardTitle>
            <CardDescription>Performance against the 95% institutional standard</CardDescription>
          </CardHeader>
          <CardContent style={{ padding: '0 1.25rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MOCK_DEPARTMENT_PERF.map((dp) => (
                <div key={dp.department}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, color: colors.primaryText }}>{dp.department}</span>
                    <strong style={{ color: dp.slaCompliancePercent >= 95 ? colors.success : colors.danger }}>
                      {dp.slaCompliancePercent}%
                    </strong>
                  </div>
                  <div style={{ height: '7px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                    <div style={{ width: `${dp.slaCompliancePercent}%`, backgroundColor: dp.slaCompliancePercent >= 95 ? colors.primaryGreen : colors.danger, height: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Category Concentration */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Top Complaint Categories Distribution</CardTitle>
            <CardDescription>Relative share of campus issues over the period</CardDescription>
          </CardHeader>
          <CardContent style={{ padding: '0 1.25rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {MOCK_TOP_CATEGORIES.map((cat) => (
                <div key={cat.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, marginBottom: '0.2rem' }}>
                    <span style={{ color: colors.primaryText, fontWeight: 500 }}>{cat.category}</span>
                    <span style={{ color: colors.secondaryText }}>{cat.percentage}% ({cat.count.toLocaleString()})</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                    <div style={{ width: `${cat.percentage * 2}%`, backgroundColor: colors.secondaryGreen, height: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Section 7 & 8: AI Performance Analytics & Escalation Intelligence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Section 7: AI Analytics */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Autonomous AI Pipeline Accuracy</CardTitle>
            <CardDescription>Classification confidence tiers and human acceptance rate</CardDescription>
          </CardHeader>
          <CardContent style={{ padding: '0 1.25rem 1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: colors.lightBotanical, padding: '0.65rem', borderRadius: radii.md }}>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Avg Confidence</div>
                <div style={{ fontWeight: 700, color: colors.primaryGreen, fontSize: typography.fontSize.lg }}>{MOCK_AI_ANALYTICS.averageConfidence}%</div>
              </div>
              <div style={{ backgroundColor: colors.lightBotanical, padding: '0.65rem', borderRadius: radii.md }}>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Auto Accepted</div>
                <div style={{ fontWeight: 700, color: colors.success, fontSize: typography.fontSize.lg }}>{MOCK_AI_ANALYTICS.autoAcceptedPercent}%</div>
              </div>
              <div style={{ backgroundColor: colors.lightBotanical, padding: '0.65rem', borderRadius: radii.md }}>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Duplicate Detect</div>
                <div style={{ fontWeight: 700, color: colors.deepForestGreen, fontSize: typography.fontSize.lg }}>{MOCK_AI_ANALYTICS.duplicateDetectionRate}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {MOCK_AI_ANALYTICS.confidenceBuckets.map((b) => (
                <div key={b.range} style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs }}>
                  <span style={{ color: colors.primaryText }}>{b.range}</span>
                  <strong>{b.count} tickets</strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 8: Escalation Analytics */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Escalation Governance Drivers</CardTitle>
            <CardDescription>Primary triggers causing Level 1–3 executive elevation</CardDescription>
          </CardHeader>
          <CardContent style={{ padding: '0 1.25rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MOCK_ESCALATION_ANALYTICS.byReason.map((r) => (
                <div key={r.reason}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, marginBottom: '0.2rem' }}>
                    <span style={{ color: colors.primaryText, fontWeight: 500 }}>{r.reason}</span>
                    <strong style={{ color: colors.danger }}>{r.percentage}% ({r.count})</strong>
                  </div>
                  <div style={{ height: '6px', backgroundColor: colors.adminBackground, borderRadius: radii.full, overflow: 'hidden' }}>
                    <div style={{ width: `${r.percentage}%`, backgroundColor: colors.danger, height: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
