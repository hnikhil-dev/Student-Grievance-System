'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminRouteId } from './types/navigation';
import { AdminLayout } from './components/layout/AdminLayout';
import { PlaceholderView } from './pages/PlaceholderView';
import { CommandCenterPage } from './pages/CommandCenter';
import { DepartmentDashboardPage } from './pages/Departments';
import { ClassificationPage } from './pages/Classification';
import { PriorityPage } from './pages/Priority';
import { DuplicatesPage } from './pages/Duplicates';
import { ClustersPage } from './pages/Clusters';
import { SlaPage } from './pages/Sla';
import { EscalationPage } from './pages/Escalation';
import { AnalyticsPage } from './pages/Analytics';
import { InsightsPage } from './pages/Insights';
import { adminApiService } from './services/adminApiService';
import { useRealtimeGrievances } from '../lib/useRealtime';

const VALID_ROUTES: AdminRouteId[] = [
  'command-center',
  'departments',
  'classification',
  'priority',
  'duplicates',
  'clusters',
  'sla',
  'escalation',
  'analytics',
  'insights',
];

export default function AdminPage() {
  const [activeRoute, setActiveRoute] = useState<AdminRouteId>('command-center');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [realtimeRefreshKey, setRealtimeRefreshKey] = useState<number>(0);

  // Sync hash with activeRoute
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window === 'undefined') return;
      const rawHash = window.location.hash || '';
      // Strip leading '#', optional leading slashes, and optional 'admin/' prefix
      const sanitized = rawHash
        .replace(/^#\/?/, '')
        .replace(/^admin\/?/, '')
        .split('?')[0]
        .split('/')[0] as AdminRouteId;

      if (VALID_ROUTES.includes(sanitized)) {
        setActiveRoute(sanitized);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch admin session from backend /api/auth/me
  useEffect(() => {
    let isMounted = true;
    adminApiService.getAdminSession().then((user) => {
      if (isMounted && user) {
        setAdminUser(user);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for realtime Supabase database changes on grievances table
  const handleRealtimeGrievanceUpdate = useCallback((payload: any) => {
    console.log('[AdminPortal] Realtime event received:', payload.eventType);
    setRealtimeRefreshKey((k) => k + 1);
  }, []);

  useRealtimeGrievances(handleRealtimeGrievanceUpdate);

  const handleRouteChange = (route: AdminRouteId) => {
    setActiveRoute(route);
    if (typeof window !== 'undefined') {
      window.location.hash = route;
    }
  };

  const renderActivePage = () => {
    switch (activeRoute) {
      case 'command-center':
        return <CommandCenterPage key={`cc-${realtimeRefreshKey}`} />;
      case 'departments':
        return <DepartmentDashboardPage key={`dept-${realtimeRefreshKey}`} />;
      case 'classification':
        return <ClassificationPage key={`class-${realtimeRefreshKey}`} />;
      case 'priority':
        return <PriorityPage key={`prio-${realtimeRefreshKey}`} />;
      case 'duplicates':
        return <DuplicatesPage key={`dup-${realtimeRefreshKey}`} />;
      case 'clusters':
        return <ClustersPage key={`clus-${realtimeRefreshKey}`} />;
      case 'sla':
        return <SlaPage key={`sla-${realtimeRefreshKey}`} />;
      case 'escalation':
        return <EscalationPage key={`esc-${realtimeRefreshKey}`} />;
      case 'analytics':
        return <AnalyticsPage key={`ana-${realtimeRefreshKey}`} />;
      case 'insights':
        return <InsightsPage onNavigate={handleRouteChange} key={`ins-${realtimeRefreshKey}`} />;
      default:
        return <PlaceholderView routeId={activeRoute} />;
    }
  };

  return (
    <AdminLayout activeRoute={activeRoute} onRouteChange={handleRouteChange}>
      {renderActivePage()}
    </AdminLayout>
  );
}
