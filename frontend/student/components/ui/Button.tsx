'use client';

import React from 'react';
import { ButtonVariant, ButtonSize } from '../../types/design-system';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  pill = true,
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Variant styles grounded in reference design (Emerald `#2D6A4F`, Outline green `#2D6A4F`, AI indigo `#4F46E5`)
  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: '#2D6A4F',
      color: '#FFFFFF',
      border: '1px solid #2D6A4F',
      boxShadow: '0 4px 12px rgba(45, 106, 79, 0.2)',
    },
    secondary: {
      backgroundColor: '#E8F5E9',
      color: '#1B4332',
      border: '1px solid #D8F3DC',
    },
    outline: {
      backgroundColor: '#FFFFFF',
      color: '#1B4332',
      border: '1px solid #2D6A4F',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#374151',
      border: '1px solid transparent',
    },
    ai: {
      backgroundColor: '#4F46E5',
      color: '#FFFFFF',
      border: '1px solid #4F46E5',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
    },
    danger: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
      border: '1px solid #DC2626',
      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
    },
  };

  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: '0.4rem 0.85rem', fontSize: '0.8125rem', gap: '0.35rem' },
    md: { padding: '0.65rem 1.25rem', fontSize: '0.9375rem', gap: '0.5rem' },
    lg: { padding: '0.85rem 1.75rem', fontSize: '1rem', gap: '0.6rem' },
  };

  const baseStyle: React.CSSProperties = {
    display: fullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    borderRadius: pill ? '9999px' : '10px',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    minHeight: size === 'sm' ? '36px' : '42px',
    boxSizing: 'border-box',
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  return (
    <button
      type={props.type || 'button'}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      style={baseStyle}
      className={`sg-button ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'sg-spin 0.8s linear infinite' }}
        />
      ) : (
        leftIcon && <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>{rightIcon}</span>}

      <style jsx>{`
        @keyframes sg-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
