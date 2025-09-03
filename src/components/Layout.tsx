'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="flex-shrink-0 border-r border-theme">
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
