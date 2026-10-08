/**
 * Admin Design System Tokens
 * Soft botanical green + warm neutral enterprise visual identity.
 */

export const colors = {
  // Primary Palette
  primaryGreen: '#427B65',
  deepForestGreen: '#14433D',
  secondaryGreen: '#6A9282',
  lightBotanical: '#E6F3EE',

  // Background & Surfaces
  adminBackground: '#F6F8F6',
  cardSurface: '#FDFDFD',
  softSky: '#E1EEF7',
  warmCream: '#F6F2E9',
  softBeige: '#EBD8C0',

  // Typography & Borders
  primaryText: '#234E42',
  secondaryText: '#71847E',
  border: '#D7E4DF',
  borderFocus: '#427B65',

  // Status & Semantic
  success: '#4F8A70',
  warning: '#C99A4A',
  danger: '#C86B62',
  info: '#427B65',
} as const;

export const typography = {
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.8125rem',  // 13px
    base: '0.875rem', // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const shadows = {
  none: 'none',
  subtle: '0 1px 3px rgba(20, 67, 61, 0.05), 0 1px 2px rgba(20, 67, 61, 0.03)',
  card: '0 2px 4px rgba(20, 67, 61, 0.04), 0 1px 2px rgba(20, 67, 61, 0.02)',
  dropdown: '0 4px 12px rgba(20, 67, 61, 0.08), 0 2px 4px rgba(20, 67, 61, 0.04)',
  modal: '0 10px 25px -5px rgba(20, 67, 61, 0.15), 0 8px 10px -6px rgba(20, 67, 61, 0.1)',
} as const;

export const radii = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  default: '200ms ease-in-out',
} as const;
