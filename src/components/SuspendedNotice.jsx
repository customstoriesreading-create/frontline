import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function SuspendedNotice({ user }) {
  return (
    <div className="app-canvas">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
        <div className="surface w-full px-6 py-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/12 text-destructive">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-heading text-lg font-semibold tracking-tight">Access suspended</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user?.full_name ? `${user.full_name}, your ` : 'Your '}
            Frontline access was suspended by a dealership owner. Ask them to reactivate you.
          </p>
          <Button
            variant="secondary"
            className="mt-6 rounded-full"
            onClick={() => base44.auth.logout('/login')}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}