import React, { useState, useMemo } from 'react';
import {
  MOCK_AI_INSIGHTS,
  AiInsightItem,
  InsightType,
  InsightPriority,
} from '../../services/insightsData';
import { AdminRouteId } from '../../types/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { colors, typography, radii, shadows, transitions } from '../../tokens';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Clock,
} from '../../components/ui/Icons';

export interface InsightsPageProps {
  onNavigate?: (route: AdminRouteId) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ onNavigate }) => {
  const [insights] = useState<AiInsightItem[]>(MOCK_AI_INSIGHTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(0);

  const filteredInsights = useMemo(() => {
    return insights.filter((item) => {
      if (selectedTypeFilter !== 'ALL' && item.type !== selectedTypeFilter) return false;
      if (selectedPriorityFilter !== 'ALL' && item.priority !== selectedPriorityFilter) return false;
      if (selectedDeptFilter !== 'ALL' && !item.affectedDepartments.includes(selectedDeptFilter)) return false;
      if (item.confidence < minConfidence) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = item.title.toLowerCase().includes(q);
        const mSummary = item.summary.toLowerCase().includes(q);
        const mAction = item.recommendedAction.toLowerCase().includes(q);
        if (!mTitle && !mSummary && !mAction) return false;
      }
      return true;
    });
  }, [insights, selectedTypeFilter, selectedPriorityFilter, selectedDeptFilter, minConfidence, searchQuery]);

  const getPriorityBadge = (priority: InsightPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <Badge variant="danger" size="sm">Critical Risk</Badge>;
      case 'HIGH':
        return <Badge variant="warning" size="sm">High Priority</Badge>;
      case 'MEDIUM':
        return <Badge variant="neutral" size="sm">Medium Priority</Badge>;
      case 'INFORMATIONAL':
        return <Badge variant="success" size="sm">Informational</Badge>;
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
            <Sparkles size={24} color={colors.primaryGreen} />
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.deepForestGreen,
                letterSpacing: '-0.02em',
              }}
            >
              AI Insights Center
            </h2>
            <Badge variant="info" size="sm">
              Operational Intelligence
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
            AI-powered observations, systemic root cause diagnostics, and prescriptive recommendations for grievance operations.
          </p>
        </div>
      </div>

      {/* 2. Intelligence Scope Callout */}
      <div
        style={{
          backgroundColor: colors.softSky,
          border: `1px solid #B8D5E5`,
          borderRadius: radii.md,
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span style={{ fontWeight: 700, color: colors.deepForestGreen, fontSize: typography.fontSize.sm }}>
            Explainable Administrative Intelligence Model
          </span>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: typography.fontSize.xs, color: colors.primaryText, lineHeight: 1.4 }}>
            Synthesized across 12,482 grievances, 8 departments, clustering topologies, and live SLA watchdog streams. Every insight contains transparent evidence and direct operational routing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: typography.fontSize.xs }}>
          <span style={{ backgroundColor: colors.cardSurface, padding: '0.25rem 0.5rem', borderRadius: radii.sm, border: `1px solid ${colors.border}` }}>
            Avg Model Confidence: <strong>91.6%</strong>
          </span>
        </div>
      </div>

      {/* 3. Filters */}
      <Card variant="flat">
        <CardContent style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ minWidth: '240px', flex: '1 1 240px' }}>
              <SearchInput
                placeholder="Search insights, recommendations, or symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Type:</span>
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
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
                  <option value="ALL">All Insight Types</option>
                  <option value="EMERGING_ISSUE">Emerging Issue</option>
                  <option value="SLA_INSIGHT">SLA Insight</option>
                  <option value="RECOMMENDATION">Recommendation</option>
                  <option value="DEPARTMENT_INSIGHT">Department Insight</option>
                  <option value="TREND_INSIGHT">Trend Insight</option>
                </select>
              </div>

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
                  <option value="INFORMATIONAL">Informational</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Confidence:</span>
                <select
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
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
                  <option value={0}>Any Confidence</option>
                  <option value={80}>≥ 80% Confidence</option>
                  <option value={90}>≥ 90% Confidence</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. AI Insight Cards Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            style={{
              backgroundColor: colors.cardSurface,
              border: `1px solid ${insight.priority === 'CRITICAL' ? '#ECC7C4' : colors.border}`,
              borderRadius: radii.lg,
              padding: '1.5rem',
              boxShadow: shadows.card,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'relative',
            }}
          >
            {/* Top Row: Icon, Title, Badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{insight.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.deepForestGreen }}>
                      {insight.title}
                    </h3>
                    {getPriorityBadge(insight.priority)}
                    <Badge variant="neutral" size="sm">{insight.typeLabel}</Badge>
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, marginTop: '0.2rem' }}>
                    Detected {insight.detectedAt} • Sectors: <strong>{insight.affectedDepartments.join(', ')}</strong> • Impact Cohort: <strong>{insight.impactCohort}</strong>
                  </div>
                </div>
              </div>

              {/* Confidence Gauge */}
              <div
                style={{
                  backgroundColor: colors.lightBotanical,
                  border: `1px solid ${colors.secondaryGreen}`,
                  padding: '0.35rem 0.75rem',
                  borderRadius: radii.md,
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Confidence</div>
                <div style={{ fontSize: typography.fontSize.md, fontWeight: 700, color: colors.primaryGreen }}>
                  {insight.confidence}%
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ fontSize: typography.fontSize.sm, color: colors.primaryText, lineHeight: 1.5, fontWeight: 500 }}>
              {insight.summary}
            </div>

            {/* Transparent Explainable Reasoning Block */}
            <div
              style={{
                backgroundColor: colors.adminBackground,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
                fontSize: typography.fontSize.xs,
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: colors.deepForestGreen, display: 'block', marginBottom: '0.2rem' }}>
                  What Happened?
                </span>
                <p style={{ margin: 0, color: colors.secondaryText, lineHeight: 1.45 }}>
                  {insight.whatHappened}
                </p>
              </div>

              <div>
                <span style={{ fontWeight: 700, color: colors.deepForestGreen, display: 'block', marginBottom: '0.2rem' }}>
                  Why AI Thinks This:
                </span>
                <p style={{ margin: 0, color: colors.secondaryText, lineHeight: 1.45 }}>
                  {insight.whyAiThinksThis}
                </p>
              </div>
            </div>

            {/* Evidence Bullets */}
            <div>
              <span style={{ fontSize: typography.fontSize.xs, fontWeight: 700, color: colors.deepForestGreen, marginBottom: '0.35rem', display: 'block' }}>
                Supporting Evidence & Audit Signals:
              </span>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: typography.fontSize.xs, color: colors.secondaryText, lineHeight: 1.5 }}>
                {insight.evidence.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>

            {/* Action Bar & Cross-Linking */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                borderTop: `1px solid ${colors.border}`,
                paddingTop: '0.85rem',
              }}
            >
              <div style={{ fontSize: typography.fontSize.xs, color: colors.deepForestGreen, maxWidth: '580px' }}>
                <strong>Prescribed Action:</strong> {insight.recommendedAction}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate(insight.relatedRoute);
                    } else if (typeof window !== 'undefined') {
                      window.location.hash = insight.relatedRoute;
                    }
                  }}
                  leftIcon={<Sparkles size={14} />}
                  rightIcon={<ArrowRight size={14} />}
                >
                  {insight.relatedActionLabel}
                </Button>
              </div>
            </div>

            {/* Accent Indicator */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '4px',
                borderTopLeftRadius: radii.lg,
                borderBottomLeftRadius: radii.lg,
                backgroundColor: insight.priority === 'CRITICAL' ? colors.danger : insight.priority === 'HIGH' ? colors.warning : colors.primaryGreen,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
