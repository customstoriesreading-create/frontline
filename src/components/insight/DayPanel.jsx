import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import StatusBadge from '@/components/StatusBadge';
import { ACCESS_LABELS, ACCESS_LEVELS } from '@/lib/roles';
import { activityLabel } from '@/lib/activity';
import { formatCurrency, formatDayTitle, formatTime } from '@/lib/format';
import { vehicleTitle } from '@/lib/vehicles';

export default function DayPanel({ dayKey }) {
  const [state, setState] = useState({ loading: true, sales: [], activities: [] });

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true }));
    Promise.all([
      base44.entities.Vehicle.filter({ status: 'sold', sold_date: dayKey }, { limit: 50 }),
      base44.entities.Activity.filter(
        { date: { $gte: `${dayKey}T00:00:00`, $lte: `${dayKey}T23:59:59.999` } },
        { sort: '-date', limit: 50 }
      ),
    ]).then(([salesPage, activityPage]) => {
      if (!active) return;
      setState({
        loading: false,
        sales: salesPage.items || [],
        activities: activityPage.items || [],
      });
    });
    return () => {
      active = false;
    };
  }, [dayKey]);

  const dayRevenue = state.sales.reduce((sum, vehicle) => sum + (vehicle.sold_price || 0), 0);
  const groups = ACCESS_LEVELS.map((level) => ({
    level,
    label: ACCESS_LABELS[level],
    items: state.activities.filter((activity) => activity.access_level === level),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="mt-4 border-t border-border/60 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-heading text-sm font-semibold tracking-tight">{formatDayTitle(dayKey)}</p>
        <p className="text-xs font-semibold text-primary">{formatCurrency(dayRevenue) || '$0'}</p>
      </div>

      {state.loading ? (
        <div className="mt-3 h-24 w-full animate-pulse rounded-[var(--radius)] bg-muted" />
      ) : (
        <div className="mt-3 space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Sales · {state.sales.length}
            </p>
            {state.sales.length === 0 ? (
              <p className="mt-1.5 text-sm text-muted-foreground">No sales recorded on this day.</p>
            ) : (
              <ul className="mt-1.5 space-y-2">
                {state.sales.map((vehicle) => (
                  <li key={vehicle.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{vehicleTitle(vehicle)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {vehicle.license_plate || vehicle.vin || 'No plate on file'}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-semibold">
                        {formatCurrency(vehicle.sold_price) || 'No price'}
                      </span>
                      <span className="mt-0.5 block">
                        <StatusBadge status={vehicle.status} />
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Activity by role · {state.activities.length}
            </p>
            {groups.length === 0 ? (
              <p className="mt-1.5 text-sm text-muted-foreground">Nothing happened on this day.</p>
            ) : (
              <div className="mt-2 space-y-3">
                {groups.map((group) => (
                  <div key={group.level}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{group.label}</p>
                    <ul className="mt-1.5 space-y-2">
                      {group.items.map((activity) => (
                        <li key={activity.id} className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block text-sm">{activity.summary}</span>
                            <span className="block text-xs text-muted-foreground">
                              {activityLabel(activity.action)} · {activity.actor_name || activity.actor_email}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">{formatTime(activity.date)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}