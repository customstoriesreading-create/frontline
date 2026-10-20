import React, { useEffect, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useCurrentUser from '@/hooks/useCurrentUser';
import { ACCESS_LABELS, resolveAccessLevel } from '@/lib/roles';
import { logActivity } from '@/lib/activity';

export default function Team() {
  const { user, accessLevel } = useCurrentUser();
  const [members, setMembers] = useState(null);
  const [email, setEmail] = useState('');
  const [inviteLevel, setInviteLevel] = useState('staff');
  const [busyId, setBusyId] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadMembers = () => base44.entities.User.list().then((records) => setMembers(records || []));

  useEffect(() => {
    loadMembers();
  }, []);

  const invite = async (event) => {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;
    setError('');
    setNotice('');
    setInviting(true);
    try {
      await base44.users.inviteUser(address, inviteLevel === 'owner' ? 'admin' : 'user');
      await logActivity({
        user,
        accessLevel,
        action: 'team.invited',
        summary: `Invited ${address} as ${ACCESS_LABELS[inviteLevel]}`,
        targetType: 'user',
      });
      setNotice(`Invite sent to ${address}.`);
      setEmail('');
      await loadMembers();
    } catch {
      setError('That invite could not be sent. Check the address and try again.');
    } finally {
      setInviting(false);
    }
  };

  const applyChange = async (member, patch) => {
    setBusyId(member.id);
    setError('');
    setNotice('');
    const name = member.full_name || member.email;
    try {
      await base44.functions.invoke('setMemberAccess', { user_id: member.id, ...patch });
      if (patch.access_level) {
        await logActivity({
          user,
          accessLevel,
          action: 'team.role',
          summary: `Set ${name} to ${ACCESS_LABELS[patch.access_level]}`,
          targetType: 'user',
          targetId: member.id,
        });
      }
      if (patch.suspended !== undefined) {
        await logActivity({
          user,
          accessLevel,
          action: patch.suspended ? 'team.suspended' : 'team.reactivated',
          summary: `${patch.suspended ? 'Suspended' : 'Reactivated'} ${name}`,
          targetType: 'user',
          targetId: member.id,
        });
      }
      await loadMembers();
    } catch {
      setError('That change could not be saved.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Team & access</h1>
        <p className="text-sm text-muted-foreground">
          Invite people, set access levels, and suspend anyone except an owner.
        </p>
      </div>

      <form onSubmit={invite} className="surface space-y-3 p-4">
        <p className="font-heading text-base font-semibold tracking-tight">Invite someone</p>
        <input
          className="field h-11 px-3.5 text-sm"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@dealership.com"
          aria-label="Email address"
        />
        <Select value={inviteLevel} onValueChange={setInviteLevel}>
          <SelectTrigger className="field h-11 px-3.5 text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Staff — inventory, status, messages</SelectItem>
            <SelectItem value="manager">Manager — plus insight and trends</SelectItem>
            <SelectItem value="owner">Owner — full control</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={inviting} className="h-11 w-full rounded-full text-sm font-semibold">
          {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Send invite
        </Button>
        <p className="text-xs text-muted-foreground">
          New members join as staff — set their access level here once they are in.
        </p>
        {notice ? <p className="text-xs font-medium text-primary">{notice}</p> : null}
        {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
      </form>

      <div className="surface p-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          People ({members ? members.length : 0})
        </p>
        {!members ? (
          <div className="h-24 animate-pulse rounded-[var(--radius)] bg-muted" />
        ) : members.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">No one has joined yet.</p>
        ) : (
          members.map((member) => {
            const level = resolveAccessLevel(member);
            const isSelf = member.id === user?.id;
            const canManage = level !== 'owner' && !isSelf;
            const name = member.full_name || member.email;
            return (
              <div
                key={member.id}
                className="border-b border-border/60 py-3 last:border-b-0 first:pt-1"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  {member.suspended ? (
                    <span className="chip shrink-0 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                      Suspended
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {canManage ? (
                    <>
                      <Select
                        value={level}
                        onValueChange={(value) => applyChange(member, { access_level: value })}
                      >
                        <SelectTrigger className="field h-9 flex-1 px-3 text-xs font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busyId === member.id}
                        onClick={() => applyChange(member, { suspended: !member.suspended })}
                        className="h-9 shrink-0 rounded-full text-xs"
                      >
                        {busyId === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        {member.suspended ? 'Reactivate' : 'Suspend'}
                      </Button>
                    </>
                  ) : (
                    <span className="chip chip-active px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                      {ACCESS_LABELS[level]}
                      {isSelf ? ' · you' : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}