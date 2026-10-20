import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LogOut, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import useCurrentUser from '@/hooks/useCurrentUser';
import { ACCESS_LABELS, ACCESS_SUMMARIES } from '@/lib/roles';
import { initialsFor } from '@/lib/format';

export default function Profile() {
  const { user, loading, accessLevel, permissions, suspended } = useCurrentUser();

  if (loading) return <div className="h-56 w-full animate-pulse rounded-[var(--radius)] bg-muted" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">You</h1>
        <p className="text-sm text-muted-foreground">Your account and what you can do in Frontline.</p>
      </div>

      <section className="surface flex items-center gap-3 p-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
          {initialsFor(user?.full_name, user?.email)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-heading text-base font-semibold tracking-tight">
            {user?.full_name || 'Signed in'}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
        </span>
      </section>

      <section className="surface p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Access level
        </p>
        <p className="mt-1.5 font-heading text-lg font-semibold tracking-tight">
          {ACCESS_LABELS[accessLevel]}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{ACCESS_SUMMARIES[accessLevel]}</p>
        {suspended ? (
          <p className="mt-2 text-xs font-medium text-destructive">Suspended by an owner.</p>
        ) : null}
      </section>

      {permissions.team ? (
        <Link to="/team" className="surface flex items-center justify-between gap-3 p-4">
          <span className="min-w-0">
            <span className="block font-heading text-sm font-semibold tracking-tight">Team & access</span>
            <span className="block text-xs text-muted-foreground">
              Invite people, set levels, suspend access.
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
          </span>
        </Link>
      ) : null}

      <Button
        variant="secondary"
        onClick={() => base44.auth.logout('/login')}
        className="h-12 w-full rounded-full text-sm font-semibold"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}