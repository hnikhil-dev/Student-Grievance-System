export type AdminRouteId =
  | 'command-center'
  | 'departments'
  | 'classification'
  | 'priority'
  | 'duplicates'
  | 'clusters'
  | 'sla'
  | 'escalation'
  | 'analytics'
  | 'insights';

export interface NavItem {
  id: AdminRouteId;
  label: string;
  href: string;
  icon: React.ReactNode | string;
  badge?: string;
  description: string;
  phase: number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
