import React from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import SuspendedNotice from '@/components/SuspendedNotice';
import useCurrentUser from '@/hooks/useCurrentUser';

export default function AppShell() {
  const { user, loading, suspended } = useCurrentUser();

  if (loading) {
    return (
      <div className="app-canvas">
        <div className="mx-auto w-full max-w-lg px-4 pt-5">
          <div className="h-36 w-full animate-pulse rounded-[var(--radius)] bg-muted" />
        </div>
      </div>
    );
  }

  if (user && suspended) return <SuspendedNotice user={user} />;

  return (
    <div className="app-canvas">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-4 pt-5 pb-32">
        <AppHeader />
        <main className="mt-5 flex-1">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}