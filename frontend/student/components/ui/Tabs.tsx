'use client';

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pill' | 'segmented' | 'underline';
  fullWidth?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'segmented',
  fullWidth = true,
}) => {
  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        aria-orientation="horizontal"
        style={{
          display: fullWidth ? 'grid' : 'inline-flex',
          gridTemplateColumns: fullWidth ? `repeat(${tabs.length}, minmax(0, 1fr))` : undefined,
          backgroundColor: '#F3F4F6',
          padding: '0.25rem',
          borderRadius: '12px',
          gap: '0.25rem',
          maxWidth: '100%',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0.5rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? '#2D6A4F' : 'transparent',
                color: isActive ? '#FFFFFF' : '#4B5563',
                boxShadow: isActive ? '0 2px 4px rgba(45, 106, 79, 0.2)' : 'none',
                transition: 'all 150ms ease',
                minWidth: 0,
              }}
            >
              {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#E5E7EB',
                    color: isActive ? '#FFFFFF' : '#374151',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', gap: '1.5rem', overflowX: 'auto', maxWidth: '100%' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 0.25rem',
              fontSize: '0.9375rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#2D6A4F' : '#6B7280',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: isActive ? '2px solid #2D6A4F' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  backgroundColor: '#E5E7EB',
                  color: '#374151',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
