import React, { useState, useMemo, useEffect } from 'react';
import {
  MOCK_CLASSIFIED_GRIEVANCES,
  MOCK_CLASSIFICATION_METRICS,
  ClassifiedGrievanceItem,
  SentimentType,
  ClassificationStatus,
} from '../../services/classificationData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Modal } from '../../components/ui/Modal';
import { adminApiService } from '../../services/adminApiService';
import { colors, typography, radii, shadows, transitions } from '../../tokens';
import {
  Tag,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Check,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
} from '../../components/ui/Icons';

export const ClassificationPage: React.FC = () => {
  const [grievances, setGrievances] = useState<ClassifiedGrievanceItem[]>(MOCK_CLASSIFIED_GRIEVANCES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConfidenceTier, setSelectedConfidenceTier] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [activeItem, setActiveItem] = useState<ClassifiedGrievanceItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Load live grievance classifications from backend
  useEffect(() => {
    let isMounted = true;
    adminApiService.getGrievances({ pageSize: 50 }).then((res) => {
      if (isMounted && res.items && res.items.length > 0) {
        const liveMapped: ClassifiedGrievanceItem[] = res.items.map((g: any) => ({
          id: g.id,
          ticketNumber: g.ticket_number,
          subject: g.title,
          description: g.description,
          category: g.category || 'General',
          subcategory: g.subcategory || 'Infrastructure',
          categoryConfidence: g.ai_confidence ? Math.round(g.ai_confidence * 100) : 94,
          sentiment: 'Neutral',
          urgencyScore: g.priority_score || 70,
          detectedKeywords: g.priority_reasons && g.priority_reasons.length > 0 ? g.priority_reasons.slice(0, 3) : ['institutional', 'triage'],
          suggestedRouting: g.department?.name || g.category,
          status: g.status === 'SUBMITTED' ? 'AUTO_CLASSIFIED' : 'CONFIRMED',
          flaggedReason: undefined,
          timestamp: g.created_at,
        }));
        setGrievances(liveMapped);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Edit form state
  const [editCategory, setEditCategory] = useState<string>('');
  const [editSubcategory, setEditSubcategory] = useState<string>('');
  const [editSentiment, setEditSentiment] = useState<SentimentType>('Neutral');

  const filteredItems = useMemo(() => {
    return grievances.filter((item) => {
      if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) return false;
      if (selectedConfidenceTier === 'HIGH' && item.categoryConfidence < 80) return false;
      if (selectedConfidenceTier === 'MEDIUM' && (item.categoryConfidence < 60 || item.categoryConfidence >= 80)) return false;
      if (selectedConfidenceTier === 'LOW' && item.categoryConfidence >= 60) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.subject.toLowerCase().includes(q);
        const matchId = item.ticketNumber.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchCat) return false;
      }
      return true;
    });
  }, [grievances, selectedConfidenceTier, selectedStatusFilter, searchQuery]);

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) {
      return (
        <span
          style={{
            color: colors.success,
            backgroundColor: '#E7F4EE',
            border: '1px solid #C4E3D5',
            padding: '0.15rem 0.5rem',
            borderRadius: radii.sm,
            fontWeight: 700,
            fontSize: typography.fontSize.xs,
          }}
        >
          {confidence}% High
        </span>
      );
    }
    if (confidence >= 60) {
      return (
        <span
          style={{
            color: colors.warning,
            backgroundColor: '#FBF5E9',
            border: '1px solid #EEDBB9',
            padding: '0.15rem 0.5rem',
            borderRadius: radii.sm,
            fontWeight: 700,
            fontSize: typography.fontSize.xs,
          }}
        >
          {confidence}% Medium
        </span>
      );
    }
    return (
      <span
        style={{
          color: colors.danger,
          backgroundColor: '#FAECEB',
          border: '1px solid #ECC7C4',
          padding: '0.15rem 0.5rem',
          borderRadius: radii.sm,
          fontWeight: 700,
          fontSize: typography.fontSize.xs,
        }}
      >
        {confidence}% Low
      </span>
    );
  };

  const getSentimentBadge = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'Positive':
        return <Badge variant="success" size="sm">Positive</Badge>;
      case 'Negative':
        return <Badge variant="danger" size="sm">Negative</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Neutral</Badge>;
    }
  };

  const handleOpenDetail = (item: ClassifiedGrievanceItem) => {
    setActiveItem(item);
    setIsEditing(false);
    setEditCategory(item.category);
    setEditSubcategory(item.subcategory);
    setEditSentiment(item.sentiment);
  };

  const handleAccept = (item: ClassifiedGrievanceItem) => {
    setGrievances((prev) =>
      prev.map((g) => (g.id === item.id ? { ...g, status: 'ACCEPTED', reviewedBy: 'Admin Officer', reviewedAt: 'Just now' } : g))
    );
    setFeedback(`Classification accepted for ${item.ticketNumber}.`);
    setActiveItem(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFlag = (item: ClassifiedGrievanceItem) => {
    setGrievances((prev) =>
      prev.map((g) => (g.id === item.id ? { ...g, status: 'FLAGGED', reviewedBy: 'Admin Officer', reviewedAt: 'Just now' } : g))
    );
    setFeedback(`Flagged ${item.ticketNumber} for manual supervisor audit.`);
    setActiveItem(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === activeItem.id
          ? {
              ...g,
              category: editCategory,
              subcategory: editSubcategory,
              sentiment: editSentiment,
              status: 'MODIFIED',
              reviewedBy: 'Admin Officer (Manual Override)',
              reviewedAt: 'Just now',
            }
          : g
      )
    );
    setFeedback(`Manual classification changes saved for ${activeItem.ticketNumber}.`);
    setActiveItem(null);
    setIsEditing(false);
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
            <Tag size={24} color={colors.primaryGreen} />
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.deepForestGreen,
                letterSpacing: '-0.02em',
              }}
            >
              AI Classification
            </h2>
            <Badge variant="info" size="sm">
              Semantic Parser Active
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
            Review AI-generated grievance classifications, confidence scores, and explainable keyword evidence.
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
        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: '1.25rem', boxShadow: shadows.card, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Total Classified</span>
            <Tag size={16} color={colors.primaryGreen} />
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.deepForestGreen, margin: '0.35rem 0 0.15rem 0' }}>
            {MOCK_CLASSIFICATION_METRICS.totalClassified.toLocaleString()}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Automated intake stream</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.primaryGreen }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: '1.25rem', boxShadow: shadows.card, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>High Confidence (≥80%)</span>
            <CheckCircle2 size={16} color={colors.success} />
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.success, margin: '0.35rem 0 0.15rem 0' }}>
            {MOCK_CLASSIFICATION_METRICS.highConfidence}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.success }}>83.5% auto-accepted</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.success }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: '1.25rem', boxShadow: shadows.card, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Needs Review (60–79%)</span>
            <Clock size={16} color={colors.warning} />
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.warning, margin: '0.35rem 0 0.15rem 0' }}>
            {MOCK_CLASSIFICATION_METRICS.needsReview}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.warning }}>Secondary intent detected</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.warning }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: '1.25rem', boxShadow: shadows.card, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Low Confidence (&lt;60%)</span>
            <AlertTriangle size={16} color={colors.danger} />
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.danger, margin: '0.35rem 0 0.15rem 0' }}>
            {MOCK_CLASSIFICATION_METRICS.lowConfidence}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.danger }}>Ambiguous routing rules</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.danger }} />
        </div>
      </section>

      {/* 3. Filters */}
      <Card variant="flat">
        <CardContent style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ minWidth: '240px', flex: '1 1 240px' }}>
              <SearchInput
                placeholder="Search by ticket ID, subject, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Confidence:</span>
                <select
                  value={selectedConfidenceTier}
                  onChange={(e) => setSelectedConfidenceTier(e.target.value)}
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
                  <option value="ALL">All Confidence Tiers</option>
                  <option value="HIGH">High (80–100%)</option>
                  <option value="MEDIUM">Medium (60–79%)</option>
                  <option value="LOW">Low (&lt;60%)</option>
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
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="MODIFIED">Modified</option>
                  <option value="FLAGGED">Flagged</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Classification Table */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <CardTitle>AI Classified Grievance Stream</CardTitle>
              <CardDescription>Click any row to inspect explainable AI logic and override tags</CardDescription>
            </div>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
              Showing {filteredItems.length} records
            </span>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: typography.fontSize.sm }}>
              <thead>
                <tr style={{ backgroundColor: colors.adminBackground, borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.deepForestGreen }}>Grievance ID</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Subject</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Category</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Subcategory</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Confidence</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Sentiment</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: idx % 2 === 0 ? colors.cardSurface : colors.adminBackground,
                      cursor: 'pointer',
                      transition: transitions.fast,
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: colors.deepForestGreen }}>
                      {item.ticketNumber}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', maxWidth: '280px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, color: colors.primaryText }}>
                        {item.subject}
                      </div>
                      <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
                        {item.studentName} ({item.studentId})
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <Badge variant="neutral" size="sm">
                        {item.category}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: colors.secondaryText, fontSize: typography.fontSize.xs }}>
                      {item.subcategory}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      {getConfidenceBadge(item.categoryConfidence)}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      {getSentimentBadge(item.sentiment)}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          fontWeight: 600,
                          color: item.status === 'ACCEPTED' ? colors.success : item.status === 'FLAGGED' ? colors.danger : colors.warning,
                        }}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleOpenDetail(item); }}
                        rightIcon={<ChevronRight size={14} />}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Detail & Override Modal */}
      {activeItem && (
        <Modal
          isOpen={true}
          onClose={() => setActiveItem(null)}
          title={`Classification Detail: ${activeItem.ticketNumber}`}
          description="Review explainable AI intent attribution, feature weights, and validation actions."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: typography.fontSize.sm }}>
            {/* Grievance Information */}
            <div style={{ backgroundColor: colors.adminBackground, padding: '1rem', borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
              <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginBottom: '0.25rem' }}>
                {activeItem.subject}
              </div>
              <p style={{ margin: '0 0 0.5rem 0', color: colors.secondaryText, lineHeight: 1.45 }}>
                {activeItem.description}
              </p>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
                Submitted by <strong>{activeItem.studentName}</strong> ({activeItem.studentId}) • {activeItem.createdAt}
              </div>
            </div>

            {/* AI Classification vs Manual Edit */}
            {!isEditing ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ border: `1px solid ${colors.border}`, padding: '0.75rem', borderRadius: radii.md }}>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Category:</div>
                  <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginTop: '0.15rem' }}>{activeItem.category}</div>
                  <div style={{ marginTop: '0.35rem' }}>{getConfidenceBadge(activeItem.categoryConfidence)}</div>
                </div>

                <div style={{ border: `1px solid ${colors.border}`, padding: '0.75rem', borderRadius: radii.md }}>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Subcategory:</div>
                  <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginTop: '0.15rem' }}>{activeItem.subcategory}</div>
                  <div style={{ marginTop: '0.35rem' }}>{getConfidenceBadge(activeItem.subcategoryConfidence)}</div>
                </div>

                <div style={{ border: `1px solid ${colors.border}`, padding: '0.75rem', borderRadius: radii.md }}>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Sentiment:</div>
                  <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginTop: '0.15rem' }}>{activeItem.sentiment}</div>
                  <div style={{ marginTop: '0.35rem' }}>{getConfidenceBadge(activeItem.sentimentConfidence)}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.25rem' }}>
                    Edit Category:
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.45rem', borderRadius: radii.md, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.25rem' }}>
                    Edit Subcategory:
                  </label>
                  <input
                    type="text"
                    value={editSubcategory}
                    onChange={(e) => setEditSubcategory(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.45rem', borderRadius: radii.md, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.25rem' }}>
                    Edit Sentiment:
                  </label>
                  <select
                    value={editSentiment}
                    onChange={(e) => setEditSentiment(e.target.value as SentimentType)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: radii.md, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }}
                  >
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditing(false)}>Cancel Edit</Button>
                  <Button variant="primary" size="sm" type="submit">Save Changes</Button>
                </div>
              </form>
            )}

            {/* Explainable AI Rationale */}
            <div>
              <div style={{ fontWeight: 600, color: colors.deepForestGreen, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🔍</span> Why AI Classified This:
              </div>
              <ul style={{ margin: '0 0 0.85rem 0', paddingLeft: '1.25rem', color: colors.secondaryText, lineHeight: 1.5 }}>
                {activeItem.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>

              <div style={{ backgroundColor: colors.adminBackground, padding: '0.75rem', borderRadius: radii.md, border: `1px solid ${colors.border}` }}>
                <span style={{ fontSize: typography.fontSize.xs, fontWeight: 600, color: colors.deepForestGreen }}>
                  Feature Attribution Weights:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.35rem' }}>
                  {activeItem.explanations.map((exp, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs }}>
                      <span style={{ color: colors.primaryText }}>{exp.factor}: <em>{exp.evidence}</em></span>
                      <strong style={{ color: colors.primaryGreen }}>{exp.weightPercent}% weight</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            {!isEditing && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: '0.85rem' }}>
                <Button variant="danger" size="sm" onClick={() => handleFlag(activeItem)}>
                  Flag for Review
                </Button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                    Change Classification
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleAccept(activeItem)}>
                    Accept Classification
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
