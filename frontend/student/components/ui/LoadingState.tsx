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

export const GrievanceDetailSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    {/* Header Skeleton Card */}
    <div
      style={{
        padding: '2rem',
        borderRadius: '24px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Skeleton height="28px" width="130px" borderRadius="10px" />
        <Skeleton height="28px" width="100px" borderRadius="9999px" />
        <Skeleton height="28px" width="90px" borderRadius="9999px" />
        <Skeleton height="28px" width="120px" borderRadius="8px" />
      </div>
      <Skeleton height="36px" width="75%" borderRadius="8px" />
      <Skeleton height="18px" width="95%" borderRadius="6px" />
      <Skeleton height="18px" width="85%" borderRadius="6px" />
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <Skeleton height="16px" width="120px" borderRadius="4px" />
        <Skeleton height="16px" width="150px" borderRadius="4px" />
        <Skeleton height="16px" width="110px" borderRadius="4px" />
      </div>
    </div>

    {/* Main Grid: Left Column + Right Column */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* SLA Countdown Card Skeleton */}
        <div
          style={{
            padding: '1.5rem',
            borderRadius: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Skeleton height="22px" width="45%" borderRadius="6px" />
          <Skeleton height="40px" width="60%" borderRadius="8px" />
          <Skeleton height="12px" width="100%" borderRadius="9999px" />
        </div>
        {/* AI Reasoning Skeleton */}
        <div
          style={{
            padding: '1.5rem',
            borderRadius: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Skeleton height="22px" width="50%" borderRadius="6px" />
          <Skeleton height="16px" width="95%" borderRadius="4px" />
          <Skeleton height="16px" width="90%" borderRadius="4px" />
          <Skeleton height="16px" width="75%" borderRadius="4px" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Timeline Skeleton */}
        <div
          style={{
            padding: '1.5rem',
            borderRadius: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <Skeleton height="24px" width="45%" borderRadius="6px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Skeleton height="24px" width="24px" borderRadius="50%" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                <Skeleton height="18px" width="55%" borderRadius="4px" />
                <Skeleton height="14px" width="35%" borderRadius="4px" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Skeleton height="24px" width="24px" borderRadius="50%" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                <Skeleton height="18px" width="70%" borderRadius="4px" />
                <Skeleton height="14px" width="40%" borderRadius="4px" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Skeleton height="24px" width="24px" borderRadius="50%" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                <Skeleton height="18px" width="60%" borderRadius="4px" />
                <Skeleton height="14px" width="30%" borderRadius="4px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
