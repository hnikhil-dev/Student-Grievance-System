'use client';

import React, { useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  helperText,
  errorMessage,
  leftIcon,
  disabled,
  className = '',
  style,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151',
  };

  const selectWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: `1px solid ${errorMessage ? '#EF4444' : isFocused ? '#2D6A4F' : '#D1D5DB'}`,
    borderRadius: '12px',
    padding: '0 0.85rem',
    boxShadow: isFocused ? '0 0 0 3px rgba(45, 106, 79, 0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
    transition: 'all 150ms ease-in-out',
    opacity: disabled ? 0.6 : 1,
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 0.4rem',
    fontSize: '0.9375rem',
    color: '#111827',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    ...style,
  };

  const selectId = props.id || (label ? `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
  const errorId = errorMessage && selectId ? `${selectId}-error` : undefined;
  const helperId = helperText && selectId ? `${selectId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label htmlFor={selectId} style={labelStyle}>
          {label}
        </label>
      )}

      <div style={selectWrapperStyle}>
        {leftIcon && <span aria-hidden="true" style={{ color: '#6B7280', display: 'flex', marginRight: '0.25rem' }}>{leftIcon}</span>}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={!!errorMessage}
          aria-describedby={describedBy}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={selectStyle}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && (
        <span id={errorId} role="alert" style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 500 }}>
          {errorMessage}
        </span>
      )}
      {!errorMessage && helperText && (
        <span id={helperId} style={{ fontSize: '0.75rem', color: '#6B7280' }}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';
