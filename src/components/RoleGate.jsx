import React from 'react';
import { ShieldCheck } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';

export default function RoleGate({ permission, children }) {
  const { permissions, loading } = useCurrentUser();

  if (loading) {
    return <div className="h-40 w-full animate-pulse rounded-[var(--radius)] bg-muted" />;
  }

  if (!permissions[permission]) {
    return (
      <div className="surface px-6 py-12 text-center">
        <ShieldCheck className="mx-auto h-7 w-7 text-muted-foreground" />
        <p className="mt-3 font-heading text-base font-semibold">Not available to your access level</p>
        <p className="mt-1 text-sm text-muted-foreground">Ask a dealership owner if you need this.</p>
      </div>
    );
  }

  return children;
}