'use client';

import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
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
=======
import {
  getDynamicAuthHeaders,
  DEFAULT_DEMO_ADMIN_ID,
  DEFAULT_DEMO_ADMIN_ROLE,
} from '@lib/api';
>>>>>>> bd3d86344eb379e968ad335006df12685dad7f1d

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

  // Robust hash synchronization supporting #<route>, #/admin/<route>, etc.
  useEffect(() => {
<<<<<<< HEAD
    const handleHashChange = () => {
      if (typeof window === 'undefined') return;
      const rawHash = window.location.hash || '';
      // Strip leading '#', optional leading slashes, and optional 'admin/' prefix
      const sanitized = rawHash
        .replace(/^#\/?/, '')
        .replace(/^admin\/?/, '')
        .split('?')[0]
        .split('/')[0] as AdminRouteId;
=======
    async function loadDashboardData() {
      try {
        const headers = getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        });
>>>>>>> bd3d86344eb379e968ad335006df12685dad7f1d

      if (VALID_ROUTES.includes(sanitized)) {
        setActiveRoute(sanitized);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleRouteChange = (route: AdminRouteId) => {
    setActiveRoute(route);
    if (typeof window !== 'undefined') {
      window.location.hash = route;
    }
  };

  const renderActivePage = () => {
    switch (activeRoute) {
      case 'command-center':
        return <CommandCenterPage />;
      case 'departments':
        return <DepartmentDashboardPage />;
      case 'classification':
        return <ClassificationPage />;
      case 'priority':
        return <PriorityPage />;
      case 'duplicates':
        return <DuplicatesPage />;
      case 'clusters':
        return <ClustersPage />;
      case 'sla':
        return <SlaPage />;
      case 'escalation':
        return <EscalationPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'insights':
        return <InsightsPage onNavigate={handleRouteChange} />;
      default:
        return <PlaceholderView routeId={activeRoute} />;
    }
<<<<<<< HEAD
  };
=======

    try {
      const res = await fetch(`/api/admin/grievances/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getDynamicAuthHeaders({
            'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
            'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
          }),
        },
        body: JSON.stringify({ resolution_notes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.data.message);
        window.location.reload();
      } else {
        alert(data.error.message);
      }
    } catch (err) {
      alert('Failed to propose resolution');
    }
  }
>>>>>>> bd3d86344eb379e968ad335006df12685dad7f1d

  return (
    <AdminLayout activeRoute={activeRoute} onRouteChange={handleRouteChange}>
      {renderActivePage()}
    </AdminLayout>
  );
}
