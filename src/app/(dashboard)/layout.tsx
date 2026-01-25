'use client';

import { ReactNode } from 'react';
import { AppSidebar } from '@/components/AppSidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
