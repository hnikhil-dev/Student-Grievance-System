'use client';

import React from 'react';

export const Skeleton: React.FC<{ height?: string; width?: string; borderRadius?: string; className?: string }> = ({
  height = '20px',
  width = '100%',
  borderRadius = '8px',
  className = '',
}) => (
  <div
    className={className}
    style={{
      height,
      width,
      borderRadius,
      backgroundColor: '#E5E7EB',
      animation: 'sg-pulse 1.5s ease-in-out infinite',
    }}
  >
    <style jsx>{`
      @keyframes sg-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `}</style>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ padding: '1rem', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '60%' }}>
          <Skeleton height="14px" width="30%" />
          <Skeleton height="20px" width="80%" />
        </div>
        <Skeleton height="28px" width="100px" borderRadius="9999px" />
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div style={{ padding: '1.5rem', borderRadius: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <Skeleton height="24px" width="40%" />
    <Skeleton height="16px" width="90%" />
    <Skeleton height="16px" width="75%" />
    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
      <Skeleton height="32px" width="120px" borderRadius="9999px" />
      <Skeleton height="32px" width="90px" borderRadius="9999px" />
    </div>
  </div>
);

export const PageSpinner: React.FC<{ label?: string }> = ({ label = 'Loading Student Portal...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#2D6A4F', borderRadius: '50%', animation: 'sg-spin 0.8s linear infinite' }} />
    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4B5563' }}>{label}</span>
    <style jsx>{`
      @keyframes sg-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);
