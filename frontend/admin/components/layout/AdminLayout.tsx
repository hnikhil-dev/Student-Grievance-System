import React, { useState } from 'react';
import { AdminRouteId } from '../../types/navigation';
import { AdminSidebar, NAV_SECTIONS } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { colors, typography } from '../../tokens';

export interface AdminLayoutProps {
  activeRoute: AdminRouteId;
  onRouteChange: (route: AdminRouteId) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeRoute,
  onRouteChange,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  // Find active route metadata
  const activeItem = NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.id === activeRoute);
  const activeSection = NAV_SECTIONS.find((s) => s.items.some((i) => i.id === activeRoute));

  const handleNavigate = (route: AdminRouteId) => {
    onRouteChange(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: colors.adminBackground,
        fontFamily: typography.fontFamily,
        color: colors.primaryText,
      }}
    >
      {/* Dynamic Lucide-Powered Sidebar */}
      <AdminSidebar
        activeRoute={activeRoute}
        onRouteChange={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: colors.adminBackground,
        }}
      >
        {/* Dynamic Lucide Header */}
        <AdminHeader
          title={activeItem?.label || 'Command Center'}
          subtitle={activeItem?.description}
          breadcrumbs={[activeSection?.title || 'OPERATIONS', activeItem?.label || '']}
          onOpenMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          searchValue={headerSearch}
          onSearchChange={setHeaderSearch}
        />

        {/* Scrollable Content Body */}
        <main
          className="admin-main-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            maxWidth: '1440px',
            width: '100%',
            boxSizing: 'border-box',
            margin: '0 auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
