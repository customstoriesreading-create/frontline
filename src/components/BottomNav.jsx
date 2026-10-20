import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Car, MessageSquare, Plus, UserRound } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUnreadMessages from '@/hooks/useUnreadMessages';

export default function BottomNav() {
  const { user, permissions } = useCurrentUser();
  const unread = useUnreadMessages(user);

  const items = [
    { to: '/', label: 'Inventory', icon: Car, end: true },
    { to: '/vehicles/new', label: 'Add', icon: Plus, end: true },
    { to: '/messages', label: 'Messages', icon: MessageSquare, badge: unread },
    ...(permissions.insight !== 'none'
      ? [{ to: '/insight', label: 'Insight', icon: BarChart3, end: true }]
      : []),
    { to: '/profile', label: 'You', icon: UserRound, end: true },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="nav-surface mx-auto flex max-w-md items-center gap-0.5 px-1.5 py-2">
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-2 text-[10px] font-semibold transition-all duration-300 ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <span className="relative">
              <Icon className="h-[18px] w-[18px]" />
              {badge > 0 ? (
                <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-destructive-foreground">
                  {badge}
                </span>
              ) : null}
            </span>
            <span className="max-w-full truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}