'use client';

import React from 'react';
import { TimelineItem } from '../../types/design-system';
import { StatusBadge } from './StatusBadge';

export interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
        No status history available yet.
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label="Grievance lifecycle audit timeline"
      style={{
        position: 'relative',
        paddingLeft: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      }}
    >
      {/* Vertical Track Line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '0.6rem',
          bottom: '0.6rem',
          left: '7px',
          width: '2px',
          backgroundColor: '#E5E7EB',
        }}
      />

      {items.map((item, idx) => {
        return (
          <div
            key={item.id || idx}
            role="listitem"
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              minWidth: 0,
            }}
          >
            {/* Step Node Dot */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '-1.75rem',
                top: '0.2rem',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: item.isCurrent ? '#2D6A4F' : item.isCompleted ? '#059669' : '#D1D5DB',
                border: '3px solid #FFFFFF',
                boxShadow: item.isCurrent ? '0 0 0 3px rgba(45, 106, 79, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            />

            {/* Header: Title & Status Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                flexWrap: 'wrap',
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', minWidth: 0 }}>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: item.isCurrent ? '#1B4332' : '#111827',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item.title}
                </span>
                <StatusBadge status={item.status} size="sm" />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {item.timestamp}
              </span>
            </div>

            {/* Actor Info */}
            {(item.actorName || item.actorRole) && (
              <div style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 600 }}>
                By: {item.actorName || item.actorRole}
              </div>
            )}

            {/* Description / Reason Notes */}
            {item.description && (
              <div
                style={{
                  marginTop: '0.25rem',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  backgroundColor: item.isCurrent ? '#F0FDF4' : '#F9FAFB',
                  border: `1px solid ${item.isCurrent ? '#DCFCE7' : '#E5E7EB'}`,
                  fontSize: '0.875rem',
                  color: '#374151',
                  lineHeight: 1.5,
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                {item.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
