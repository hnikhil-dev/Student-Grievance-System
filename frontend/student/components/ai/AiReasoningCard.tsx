'use client';

import React from 'react';
import { Sparkles, Check, Landmark, Clock, ShieldCheck } from 'lucide-react';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { SlaIndicator } from '../ui/SlaIndicator';
import { AiBadge } from './AiBadge';

export interface AiAnalysisResult {
  category: string;
  subcategory?: string | null;
  severity: string;
  urgency: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priorityScore: number;
  priorityReasons: string[];
  department?: string;
  summary: string;
  confidence: number;
}

export interface AiReasoningCardProps {
  analysis: AiAnalysisResult;
  isAiEnhanced?: boolean;
  onApplyCategory?: (cat: string) => void;
  titleOverride?: string;
  showSummary?: boolean;
}

export const AiReasoningCard: React.FC<AiReasoningCardProps> = ({
  analysis,
  isAiEnhanced = true,
  onApplyCategory,
  titleOverride,
  showSummary = true,
}) => {
  if (!analysis) return null;

  const targetHours =
    analysis.priority === 'CRITICAL'
      ? 4
      : analysis.priority === 'HIGH'
      ? 12
      : analysis.priority === 'MEDIUM'
      ? 24
      : 48;

  return (
    <div
      className="sg-animate-slide-up"
      style={{
        padding: '1.5rem',
        borderRadius: '20px',
        backgroundColor: '#F8FAFC',
        border: '1px solid #C7D2FE',
        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E0E7FF', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: '#4F46E5',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
            }}
          >
            <Sparkles size={18} color="#FFFFFF" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1E1B4B' }}>
              {titleOverride || 'Automated Categorization'}
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#4338CA' }}>
              Suggested department and estimated resolution window
            </span>
          </div>
        </div>

        <AiBadge
          label={isAiEnhanced ? 'Auto-Assigned' : 'Standard Rules'}
          variant="indigo"
        />
      </div>

      {/* Structured Complaint Understanding */}
      {showSummary && analysis.summary && (
        <div
          style={{
            backgroundColor: '#EEF2FF',
            borderRadius: '12px',
            border: '1px solid #C7D2FE',
            padding: '0.85rem 1rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#3730A3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>
            Request Summary
          </span>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#1E1B4B', lineHeight: 1.5, fontWeight: 500 }}>
            {analysis.summary}
          </p>
        </div>
      )}

      {/* Grid of Key AI Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
        {/* Recommended Category */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
              CATEGORY
            </span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>
              {analysis.category}
            </span>
          </div>
          {onApplyCategory && (
            <button
              type="button"
              onClick={() => onApplyCategory(analysis.category)}
              style={{
                marginTop: '0.4rem',
                fontSize: '0.75rem',
                color: '#4F46E5',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                padding: 0,
                textAlign: 'left',
              }}
            >
              <Check size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Use this category
            </button>
          )}
        </div>

        {/* Priority */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
            PRIORITY
          </span>
          <div style={{ marginTop: '0.15rem' }}>
            <PriorityBadge priority={analysis.priority} size="sm" />
          </div>
        </div>

        {/* Target Department */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
            RESPONSIBLE DEPARTMENT
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1B4332', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '0.2rem' }}>
            <Landmark size={14} color="#1B4332" />
            <span>{analysis.department || 'IT Services'}</span>
          </span>
        </div>

        {/* SLA Awareness Target */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
            ESTIMATED RESOLUTION
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2D6A4F', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '0.2rem' }}>
            <Clock size={14} color="#2D6A4F" />
            <span>{targetHours} Hours</span>
          </span>
        </div>
      </div>

      {/* Decision Factors */}
      {analysis.priorityReasons && analysis.priorityReasons.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h5 style={{ margin: 0, fontSize: '0.775rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Key Factors Identified
            </h5>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
            {analysis.priorityReasons.map((reason, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                <span style={{ color: '#0F172A', fontWeight: 500 }}>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Helpful Student Note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.75rem', color: '#64748B', borderTop: '1px solid #E0E7FF', paddingTop: '0.75rem' }}>
        <ShieldCheck size={16} color="#4F46E5" />
        <span>
          These details are automatically organized to speed up resolution. You can review or edit anytime.
        </span>
      </div>
    </div>
  );
};

