'use client';

import React from 'react';
import { MetricCardData } from '../../types/design-system';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'floating' | 'glass' | 'interactive';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'floating',
  children,
  className = '',
  style,
  ...props
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    floating: {
      backgroundColor: '#FFFFFF',
      borderRadius: '24px', // Grounded in reference design floating white card
      border: '1px solid rgba(229, 231, 235, 0.8)',
      boxShadow: '0 20px 40px -15px rgba(27, 67, 50, 0.1), 0 10px 20px -10px rgba(0, 0, 0, 0.04)',
    },
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    },
    interactive: {
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      cursor: 'pointer',
      transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
    },
  };

  return (
    <div
      style={{
        padding: '1.75rem',
        ...variantStyles[variant],
        ...style,
      }}
      className={`sg-card-container ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, style, ...props }) => (
  <div style={{ marginBottom: '1.25rem', ...style }} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, style, ...props }) => (
  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em', ...style }} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, style, ...props }) => (
  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280', ...style }} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, style, ...props }) => (
  <div style={{ ...style }} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, style, ...props }) => (
  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...style }} {...props}>
    {children}
  </div>
);

export const MetricCard: React.FC<{ data: MetricCardData }> = ({ data }) => {
  const variantColors: Record<string, { bg: string; border: string; iconBg: string; text: string }> = {
    emerald: { bg: '#F0FDF4', border: '#DCFCE7', iconBg: '#2D6A4F', text: '#1B4332' },
    amber: { bg: '#FFFBEB', border: '#FDE68A', iconBg: '#D97706', text: '#92400E' },
    indigo: { bg: '#EEF2FF', border: '#C7D2FE', iconBg: '#4F46E5', text: '#3730A3' },
    rose: { bg: '#FEF2F2', border: '#FCA5A5', iconBg: '#DC2626', text: '#991B1B' },
    neutral: { bg: '#F9FAFB', border: '#E5E7EB', iconBg: '#4B5563', text: '#1F2937' },
  };

  const styleConfig = variantColors[data.variant || 'emerald'];

  return (
    <Card variant="floating" style={{ padding: '1.25rem', backgroundColor: styleConfig.bg, borderColor: styleConfig.border }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4B5563' }}>{data.title}</span>
        {data.icon && (
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: styleConfig.iconBg, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
            {data.icon}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.875rem', fontWeight: 800, color: styleConfig.text }}>{data.value}</span>
        {data.trend && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: data.trend.isPositive ? '#059669' : '#DC2626' }}>
            {data.trend.isPositive ? '↑' : '↓'} {data.trend.value}
          </span>
        )}
      </div>
      {data.subtitle && (
        <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.35rem', display: 'block' }}>
          {data.subtitle}
        </span>
      )}
    </Card>
  );
};
