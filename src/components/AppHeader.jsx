import React from 'react';
import { Link } from 'react-router-dom';
import { Gauge } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';
import { ACCESS_LABELS } from '@/lib/roles';

export default function AppHeader() {
  const { user, accessLevel } = useCurrentUser();

  return (
    <header className="flex items-center justify-between gap-3">
      <Link to="/" className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-[calc(var(--radius)*0.7)] bg-primary text-primary-foreground shadow-sm">
          <Gauge className="h-5 w-5" />
        </span>
        <span className="leading-tight">
          <span className="block font-heading text-lg font-semibold tracking-tight">Frontline</span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Lot inventory
          </span>
        </span>
      </Link>
      {user ? (
        <span className="chip chip-active px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
          {ACCESS_LABELS[accessLevel]}
        </span>
      ) : null}
    </header>
  );
}