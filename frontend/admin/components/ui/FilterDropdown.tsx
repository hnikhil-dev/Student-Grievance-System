import React from 'react';
import { colors, typography, radii, transitions } from '../../tokens';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: FilterOption[];
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && (
        <label
          style={{
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.medium,
            color: colors.secondaryText,
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.fontSize.sm,
          color: colors.primaryText,
          backgroundColor: colors.cardSurface,
          border: `1px solid ${isFocused ? colors.primaryGreen : colors.border}`,
          borderRadius: radii.md,
          padding: '0.45rem 1.75rem 0.45rem 0.75rem',
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2371847E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1rem',
          boxShadow: isFocused ? `0 0 0 2px ${colors.lightBotanical}` : 'none',
          transition: `all ${transitions.fast}`,
          ...style,
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
