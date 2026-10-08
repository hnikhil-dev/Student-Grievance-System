import React, { useState, useMemo, useEffect } from 'react';
import {
  MOCK_DUPLICATE_PAIRS,
  MOCK_DUPLICATE_METRICS,
  DuplicatePairItem,
} from '../../services/duplicateData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Modal } from '../../components/ui/Modal';
import { adminApiService } from '../../services/adminApiService';
import { colors, typography, radii, shadows, transitions } from '../../tokens';
import {
  Copy,
  CheckCircle2,
  Layers,
  AlertTriangle,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Clock,
} from '../../components/ui/Icons';

export const DuplicatesPage: React.FC = () => {
  const [pairs, setPairs] = useState<DuplicatePairItem[]>(MOCK_DUPLICATE_PAIRS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSimilarityTier, setSelectedSimilarityTier] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Load live duplicate pairs from backend
  useEffect(() => {
    let isMounted = true;
    adminApiService.getClusters().then((res) => {
      if (isMounted && res.duplicatePairs && res.duplicatePairs.length > 0) {
        setPairs(res.duplicatePairs);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Comparison & Merge modal states
  const [comparingPair, setComparingPair] = useState<DuplicatePairItem | null>(null);
  const [isMergeConfirmOpen, setIsMergeConfirmOpen] = useState<boolean>(false);
  const [mergeNotes, setMergeNotes] = useState<string>('');

  const filteredPairs = useMemo(() => {
    return pairs.filter((item) => {
      if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) return false;
      if (selectedSimilarityTier === 'HIGH' && item.similarityScore < 80) return false;
      if (selectedSimilarityTier === 'MEDIUM' && (item.similarityScore < 60 || item.similarityScore >= 80)) return false;
      if (selectedSimilarityTier === 'LOW' && item.similarityScore >= 60) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mPri = item.primaryGrievance.subject.toLowerCase().includes(q) || item.primaryGrievance.ticketNumber.toLowerCase().includes(q);
        const mCand = item.candidateGrievance.subject.toLowerCase().includes(q) || item.candidateGrievance.ticketNumber.toLowerCase().includes(q);
        if (!mPri && !mCand) return false;
      }
      return true;
    });
  }, [pairs, selectedSimilarityTier, selectedStatusFilter, searchQuery]);

  const getSimilarityBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span
          style={{
            color: colors.primaryGreen,
            backgroundColor: '#E6F3EE',
            border: `1px solid ${colors.secondaryGreen}`,
            padding: '0.15rem 0.5rem',
            borderRadius: radii.sm,
            fontWeight: 700,
            fontSize: typography.fontSize.xs,
          }}
        >
          {score}% High
        </span>
      );
    }
    if (score >= 60) {
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
          {score}% Medium
        </span>
      );
    }
    return (
      <span
        style={{
          color: colors.secondaryText,
          backgroundColor: '#F0F0F0',
          border: `1px solid ${colors.border}`,
          padding: '0.15rem 0.5rem',
          borderRadius: radii.sm,
          fontWeight: 700,
          fontSize: typography.fontSize.xs,
        }}
      >
        {score}% Low
      </span>
    );
  };

  const handleDismissDuplicate = (pair: DuplicatePairItem) => {
    setPairs((prev) =>
      prev.map((p) => (p.id === pair.id ? { ...p, status: 'DISMISSED', reviewedBy: 'Admin Officer' } : p))
    );
    setFeedback(`Marked ${pair.candidateGrievance.ticketNumber} as NOT a duplicate of ${pair.primaryGrievance.ticketNumber}.`);
    setComparingPair(null);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleConfirmMerge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comparingPair) return;

    setPairs((prev) =>
      prev.map((p) =>
        p.id === comparingPair.id
          ? {
              ...p,
              status: 'MERGED',
              mergedAt: 'Just now',
              reviewedBy: 'Admin Officer',
            }
          : p
      )
    );

    setFeedback(
      `Successfully linked ${comparingPair.candidateGrievance.ticketNumber} into parent incident ${comparingPair.primaryGrievance.ticketNumber}. Student notified.`
    );
    setIsMergeConfirmOpen(false);
    setComparingPair(null);
    setMergeNotes('');
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
            <Copy size={24} color={colors.primaryGreen} />
            <h2
              style={{
                margin: 0,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.deepForestGreen,
                letterSpacing: '-0.02em',
              }}
            >
              Duplicate Detection
            </h2>
            <Badge variant="info" size="sm">
              Supervised Matching
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
            Identify potentially duplicate student grievances across cohorts. AI suggests similarity — administrator retains approval.
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
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Potential Duplicates</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.deepForestGreen, margin: '0.25rem 0' }}>
            {MOCK_DUPLICATE_METRICS.potentialDuplicates}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Clustered candidates</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.primaryGreen }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>High Similarity (≥80%)</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.primaryGreen, margin: '0.25rem 0' }}>
            {MOCK_DUPLICATE_METRICS.highSimilarity}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.primaryGreen }}>Strong semantic overlap</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.secondaryGreen }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Awaiting Review</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.warning, margin: '0.25rem 0' }}>
            {MOCK_DUPLICATE_METRICS.awaitingReview}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.warning }}>Pending admin approval</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.warning }} />
        </div>

        <div style={{ backgroundColor: colors.cardSurface, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: '1.25rem', position: 'relative' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, fontWeight: 500 }}>Merged Today</span>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: 700, color: colors.success, margin: '0.25rem 0' }}>
            {MOCK_DUPLICATE_METRICS.mergedToday}
          </div>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.success }}>Consolidated tickets</span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: colors.success }} />
        </div>
      </section>

      {/* 3. Filters */}
      <Card variant="flat">
        <CardContent style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ minWidth: '240px', flex: '1 1 240px' }}>
              <SearchInput
                placeholder="Search by ticket numbers or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>Similarity:</span>
                <select
                  value={selectedSimilarityTier}
                  onChange={(e) => setSelectedSimilarityTier(e.target.value)}
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
                  <option value="ALL">All Similarities</option>
                  <option value="HIGH">High (80%+)</option>
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
                  <option value="AWAITING_REVIEW">Awaiting Review</option>
                  <option value="MERGED">Merged</option>
                  <option value="DISMISSED">Not Duplicate</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Duplicate Candidate Table */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <CardTitle>Duplicate Candidate Pairs</CardTitle>
              <CardDescription>Side-by-side comparison with keyword alignment and merge authorization</CardDescription>
            </div>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText }}>
              Showing {filteredPairs.length} candidate pairs
            </span>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: typography.fontSize.sm }}>
              <thead>
                <tr style={{ backgroundColor: colors.adminBackground, borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.deepForestGreen }}>Primary Grievance</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Possible Duplicate</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Similarity</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen }}>Department</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Detected</th>
                  <th style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.deepForestGreen, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPairs.map((pair, idx) => (
                  <tr
                    key={pair.id}
                    onClick={() => setComparingPair(pair)}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: idx % 2 === 0 ? colors.cardSurface : colors.adminBackground,
                      cursor: 'pointer',
                      transition: transitions.fast,
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', maxWidth: '240px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: colors.deepForestGreen, fontSize: typography.fontSize.xs }}>
                        {pair.primaryGrievance.ticketNumber}
                      </div>
                      <div style={{ fontWeight: 500, color: colors.primaryText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pair.primaryGrievance.subject}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', maxWidth: '240px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: colors.primaryGreen, fontSize: typography.fontSize.xs }}>
                        {pair.candidateGrievance.ticketNumber}
                      </div>
                      <div style={{ fontWeight: 500, color: colors.primaryText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pair.candidateGrievance.subject}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      {getSimilarityBadge(pair.similarityScore)}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <Badge variant="neutral" size="sm">{pair.department}</Badge>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', color: colors.secondaryText, fontSize: typography.fontSize.xs }}>
                      {pair.created}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          fontWeight: 600,
                          color: pair.status === 'MERGED' ? colors.success : pair.status === 'DISMISSED' ? colors.secondaryText : colors.warning,
                        }}
                      >
                        {pair.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setComparingPair(pair); }}>
                        Compare →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Side-By-Side Comparison Modal */}
      {comparingPair && (
        <Modal
          isOpen={true}
          onClose={() => setComparingPair(null)}
          title={`Compare Grievances: ${comparingPair.primaryGrievance.ticketNumber} vs ${comparingPair.candidateGrievance.ticketNumber}`}
          description={`AI Similarity Score: ${comparingPair.similarityScore}% • ${comparingPair.semanticMatchReason}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: typography.fontSize.sm }}>
            {/* Shared Keywords Bar */}
            <div style={{ backgroundColor: colors.lightBotanical, padding: '0.85rem 1rem', borderRadius: radii.md, border: `1px solid ${colors.secondaryGreen}` }}>
              <div style={{ fontSize: typography.fontSize.xs, fontWeight: 700, color: colors.deepForestGreen, marginBottom: '0.35rem' }}>
                Shared Matching Keywords & Entities:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {comparingPair.sharedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: colors.cardSurface,
                      color: colors.primaryGreen,
                      border: `1px solid ${colors.border}`,
                      fontSize: typography.fontSize.xs,
                      padding: '0.15rem 0.45rem',
                      borderRadius: radii.sm,
                      fontWeight: 600,
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Side-by-Side Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Primary Grievance A */}
              <div style={{ border: `1px solid ${colors.primaryGreen}`, borderRadius: radii.md, padding: '1rem', backgroundColor: colors.cardSurface }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: colors.deepForestGreen, fontFamily: 'monospace' }}>
                    {comparingPair.primaryGrievance.ticketNumber} (Primary A)
                  </span>
                  <PriorityBadge level={comparingPair.primaryGrievance.priority} />
                </div>
                <div style={{ fontWeight: 600, color: colors.primaryText, marginBottom: '0.4rem' }}>
                  {comparingPair.primaryGrievance.subject}
                </div>
                <p style={{ margin: '0 0 0.75rem 0', color: colors.secondaryText, fontSize: typography.fontSize.xs, lineHeight: 1.45 }}>
                  {comparingPair.primaryGrievance.description}
                </p>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, borderTop: `1px solid ${colors.border}`, paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div>Category: <strong>{comparingPair.primaryGrievance.category}</strong></div>
                  <div>Department: <strong>{comparingPair.primaryGrievance.department}</strong></div>
                  <div>Student: <strong>{comparingPair.primaryGrievance.studentName}</strong> ({comparingPair.primaryGrievance.studentId})</div>
                  <div>Created: <strong>{comparingPair.primaryGrievance.createdDate}</strong></div>
                  <div>Status: <strong>{comparingPair.primaryGrievance.status}</strong></div>
                </div>
              </div>

              {/* Candidate Grievance B */}
              <div style={{ border: `1px solid ${colors.secondaryGreen}`, borderRadius: radii.md, padding: '1rem', backgroundColor: colors.cardSurface }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: colors.primaryGreen, fontFamily: 'monospace' }}>
                    {comparingPair.candidateGrievance.ticketNumber} (Candidate B)
                  </span>
                  <PriorityBadge level={comparingPair.candidateGrievance.priority} />
                </div>
                <div style={{ fontWeight: 600, color: colors.primaryText, marginBottom: '0.4rem' }}>
                  {comparingPair.candidateGrievance.subject}
                </div>
                <p style={{ margin: '0 0 0.75rem 0', color: colors.secondaryText, fontSize: typography.fontSize.xs, lineHeight: 1.45 }}>
                  {comparingPair.candidateGrievance.description}
                </p>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.secondaryText, borderTop: `1px solid ${colors.border}`, paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div>Category: <strong>{comparingPair.candidateGrievance.category}</strong></div>
                  <div>Department: <strong>{comparingPair.candidateGrievance.department}</strong></div>
                  <div>Student: <strong>{comparingPair.candidateGrievance.studentName}</strong> ({comparingPair.candidateGrievance.studentId})</div>
                  <div>Created: <strong>{comparingPair.candidateGrievance.createdDate}</strong></div>
                  <div>Status: <strong>{comparingPair.candidateGrievance.status}</strong></div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            {comparingPair.status !== 'MERGED' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: '0.85rem' }}>
                <Button variant="outline" size="sm" onClick={() => handleDismissDuplicate(comparingPair)}>
                  Not Duplicate
                </Button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="secondary" size="sm" onClick={() => setComparingPair(null)}>
                    Close
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setIsMergeConfirmOpen(true)}>
                    Merge Grievances...
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#E7F4EE', padding: '0.65rem 1rem', borderRadius: radii.md, color: colors.success, fontSize: typography.fontSize.xs, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>✓ Merged into parent incident by {comparingPair.reviewedBy} at {comparingPair.mergedAt}</span>
                <Button variant="secondary" size="sm" onClick={() => setComparingPair(null)}>Close</Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 6. Merge Confirmation Dialog */}
      {isMergeConfirmOpen && comparingPair && (
        <Modal
          isOpen={true}
          onClose={() => setIsMergeConfirmOpen(false)}
          title={`Confirm Ticket Merge: ${comparingPair.candidateGrievance.ticketNumber} → ${comparingPair.primaryGrievance.ticketNumber}`}
          description="Merge operation links candidate ticket to the primary master ticket. Candidate will receive resolution updates automatically."
        >
          <form onSubmit={handleConfirmMerge} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: typography.fontSize.sm }}>
            <div style={{ backgroundColor: '#FAECEB', border: '1px solid #ECC7C4', padding: '0.75rem', borderRadius: radii.md, color: colors.danger, fontSize: typography.fontSize.xs }}>
              <strong>Caution:</strong> This action links <em>{comparingPair.candidateGrievance.studentName}</em> to master ticket <em>{comparingPair.primaryGrievance.ticketNumber}</em>. The candidate will close upon primary resolution.
            </div>

            <div>
              <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.secondaryText, marginBottom: '0.35rem' }}>
                Consolidation Note for Student & Assignee:
              </label>
              <textarea
                rows={3}
                value={mergeNotes}
                onChange={(e) => setMergeNotes(e.target.value)}
                placeholder="Optional merge rationale or incident tracking reference..."
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
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsMergeConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Authorize Merge
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
