import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

const defaultProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const LayoutDashboard: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

export const Building2: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);

export const Tag: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);

export const Zap: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const Copy: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export const Network: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <rect x="16" y="16" width="6" height="6" rx="1" />
    <rect x="2" y="16" width="6" height="6" rx="1" />
    <rect x="9" y="2" width="6" height="6" rx="1" />
    <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
    <path d="M12 12V8" />
  </svg>
);

export const Clock: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const AlertTriangle: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const BarChart3: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

export const Sparkles: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

export const Search: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const Bell: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const Menu: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

export const X: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const RefreshCw: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

export const Check: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CheckCircle2: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const AlertCircle: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const XCircle: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export const ChevronDown: React.FC<IconProps> = ({ size = 16, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronRight: React.FC<IconProps> = ({ size = 16, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ChevronLeft: React.FC<IconProps> = ({ size = 16, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const ArrowRight: React.FC<IconProps> = ({ size = 16, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export const ArrowUp: React.FC<IconProps> = ({ size = 16, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
);

export const ArrowDown: React.FC<IconProps> = ({ size = 16, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);

export const User: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const Shield: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);

export const Info: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export const Filter: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const SlidersHorizontal: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <line x1="21" y1="4" x2="14" y2="4" />
    <line x1="10" y1="4" x2="3" y2="4" />
    <line x1="21" y1="12" x2="12" y2="12" />
    <line x1="8" y1="12" x2="3" y2="12" />
    <line x1="21" y1="20" x2="16" y2="20" />
    <line x1="12" y1="20" x2="3" y2="20" />
    <line x1="14" y1="2" x2="14" y2="6" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="16" y1="18" x2="16" y2="22" />
  </svg>
);

export const Download: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const Eye: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const FileText: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

export const Activity: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const Radio: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
  </svg>
);

export const TrendingUp: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

export const TrendingDown: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

export const Layers: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5" />
    <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5" />
  </svg>
);

export const Inbox: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export const Send: React.FC<IconProps> = ({ size = 18, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const Leaf: React.FC<IconProps> = ({ size = 20, color, strokeWidth = 2, style, ...props }) => (
  <svg width={size} height={size} {...defaultProps} stroke={color || 'currentColor'} strokeWidth={strokeWidth} style={style} {...props}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);
