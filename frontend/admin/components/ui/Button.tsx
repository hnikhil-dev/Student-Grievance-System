import React from 'react';
import { ButtonProps } from '../../types/ui';
import { colors, typography, radii, transitions, shadows } from '../../tokens';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  style,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  // Size styling
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '0.375rem 0.75rem',
      fontSize: typography.fontSize.xs,
      gap: '0.375rem',
    },
    md: {
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.base,
      gap: '0.5rem',
    },
    lg: {
      padding: '0.625rem 1.25rem',
      fontSize: typography.fontSize.md,
      gap: '0.625rem',
    },
  };

  // Variant styling
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isHovered ? colors.deepForestGreen : colors.primaryGreen,
          color: '#FFFFFF',
          border: '1px solid transparent',
          boxShadow: isHovered ? shadows.subtle : 'none',
        };
      case 'secondary':
        return {
          backgroundColor: isHovered ? colors.lightBotanical : colors.cardSurface,
          color: colors.primaryText,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.subtle,
        };
      case 'outline':
        return {
          backgroundColor: isHovered ? colors.lightBotanical : 'transparent',
          color: colors.primaryGreen,
          border: `1px solid ${colors.primaryGreen}`,
        };
      case 'ghost':
        return {
          backgroundColor: isHovered ? colors.lightBotanical : 'transparent',
          color: colors.primaryText,
          border: '1px solid transparent',
        };
      case 'danger':
        return {
          backgroundColor: isHovered ? '#B3554D' : colors.danger,
          color: '#FFFFFF',
          border: '1px solid transparent',
        };
      default:
        return {};
    }
  };

  const isDisabled = disabled || isLoading;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 1.5,
    borderRadius: radii.md,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    transition: `all ${transitions.default}`,
    outline: 'none',
    userSelect: 'none',
    transform: isActive && !isDisabled ? 'scale(0.98)' : 'none',
    ...sizeStyles[size],
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      disabled={isDisabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={baseStyle}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.75s linear infinite',
            marginRight: '0.25rem',
          }}
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
