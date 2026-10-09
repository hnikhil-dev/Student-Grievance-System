'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  errorMessage,
  leftIcon,
  rightIcon,
  isPasswordToggle = false,
  type = 'text',
  disabled,
  className = '',
  style,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = isPasswordToggle ? (showPassword ? 'text' : 'password') : type;

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

  const inputWrapperStyle: React.CSSProperties = {
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 0.4rem',
    fontSize: '0.9375rem',
    color: '#111827',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    ...style,
  };

  const inputId = props.id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
  const errorId = errorMessage && inputId ? `${inputId}-error` : undefined;
  const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      
      <div style={inputWrapperStyle}>
        {leftIcon && <span aria-hidden="true" style={{ color: '#6B7280', display: 'flex', marginRight: '0.25rem' }}>{leftIcon}</span>}
        
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          disabled={disabled}
          aria-invalid={!!errorMessage}
          aria-describedby={describedBy}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={inputStyle}
          {...props}
        />

        {isPasswordToggle ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              minHeight: '36px',
              borderRadius: '6px',
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : (
          rightIcon && <span aria-hidden="true" style={{ color: '#6B7280', display: 'flex', marginLeft: '0.25rem' }}>{rightIcon}</span>
        )}
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

Input.displayName = 'Input';
