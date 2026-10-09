'use client';

import React, { useState } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helperText,
  errorMessage,
  disabled,
  className = '',
  rows = 4,
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

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 0.85rem',
    fontSize: '0.9375rem',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    border: `1px solid ${errorMessage ? '#EF4444' : isFocused ? '#2D6A4F' : '#D1D5DB'}`,
    borderRadius: '12px',
    boxShadow: isFocused ? '0 0 0 3px rgba(45, 106, 79, 0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 150ms ease-in-out',
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const textareaId = props.id || (label ? `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
  const errorId = errorMessage && textareaId ? `${textareaId}-error` : undefined;
  const helperId = helperText && textareaId ? `${textareaId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label htmlFor={textareaId} style={labelStyle}>
          {label}
          {props.required && <span style={{ color: '#DC2626', marginLeft: '4px' }} title="Required field">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        aria-invalid={!!errorMessage}
        aria-describedby={describedBy}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={textareaStyle}
        {...props}
      />

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

Textarea.displayName = 'Textarea';
