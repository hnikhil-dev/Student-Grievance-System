import React from 'react';
import { colors, typography, radii, transitions } from '../../tokens';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  style?: React.CSSProperties;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.25rem',
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '2px',
        overflowX: 'auto',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.85rem',
              fontFamily: typography.fontFamily,
              fontSize: typography.fontSize.sm,
              fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
              color: isActive ? colors.primaryGreen : colors.secondaryText,
              backgroundColor: isActive ? colors.lightBotanical : 'transparent',
              border: 'none',
              borderBottom: `2px solid ${isActive ? colors.primaryGreen : 'transparent'}`,
              borderRadius: `${radii.md} ${radii.md} 0 0`,
              cursor: 'pointer',
              transition: `all ${transitions.fast}`,
              outline: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: typography.fontSize.xs,
                  padding: '0.1rem 0.35rem',
                  borderRadius: radii.full,
                  backgroundColor: isActive ? colors.primaryGreen : colors.adminBackground,
                  color: isActive ? '#FFFFFF' : colors.secondaryText,
                  fontWeight: typography.fontWeight.bold,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
