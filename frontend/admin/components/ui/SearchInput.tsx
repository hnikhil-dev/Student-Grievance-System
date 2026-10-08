import React from 'react';
import { colors, typography, radii, transitions } from '../../tokens';
import { Search, X } from './Icons';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search tickets, departments, keywords...',
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '360px',
      }}
    >
      {/* Lucide Search Icon */}
      <span
        style={{
          position: 'absolute',
          left: '0.75rem',
          color: colors.secondaryText,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search size={16} />
      </span>

      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.5rem 2rem 0.5rem 2.25rem',
          fontFamily: typography.fontFamily,
          fontSize: typography.fontSize.sm,
          color: colors.primaryText,
          backgroundColor: colors.cardSurface,
          border: `1px solid ${isFocused ? colors.primaryGreen : colors.border}`,
          borderRadius: radii.md,
          outline: 'none',
          boxShadow: isFocused ? `0 0 0 2px ${colors.lightBotanical}` : 'none',
          transition: `all ${transitions.fast}`,
          ...style,
        }}
        {...props}
      />

      {/* Lucide Clear Button */}
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '0.5rem',
            background: 'none',
            border: 'none',
            color: colors.secondaryText,
            cursor: 'pointer',
            padding: '0.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
