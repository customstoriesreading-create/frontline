import React, { useEffect, useState } from 'react';
import { loadLotStats } from '@/lib/lotStats';

const STATUS_ORDER = ['available', 'reserved', 'sold'];
const STATUS_LABELS = { available: 'Available', reserved: 'Reserved', sold: 'Sold' };

export default function StockSummary() {
  const [state, setState] = useState({ loading: true, stats: null, failed: false });

  useEffect(() => {
    let active = true;
    loadLotStats()
      .then((stats) => {
        if (active) setState({ loading: false, stats, failed: false });
      })
      .catch(() => {
        if (active) setState({ loading: false, stats: null, failed: true });
      });
    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return <div className="h-32 w-full animate-pulse rounded-[var(--radius)] bg-muted" />;
  }

  if (state.failed || !state.stats) {
    return (
      <section className="surface p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Stock summary
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          The counts are unavailable right now — they refresh on your next visit.
        </p>
      </section>
    );
  }

  const { stats } = state;
  const maxBrand = Math.max(1, ...stats.brands.map((row) => row.count));

  return (
    <section className="surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Stock summary
        </p>
        <p className="text-xs text-muted-foreground">
          {stats.brands.length} brand{stats.brands.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <div className="rounded-[calc(var(--radius)*0.7)] bg-primary/12 px-2 py-2.5 text-center">
          <p className="font-heading text-xl font-semibold tracking-tight">{stats.total}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
        </div>
        {STATUS_ORDER.map((status) => (
          <div key={status} className="rounded-[calc(var(--radius)*0.7)] bg-muted/70 px-2 py-2.5 text-center">
            <p className="font-heading text-xl font-semibold tracking-tight">{stats.byStatus[status] || 0}</p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {STATUS_LABELS[status]}
            </p>
          </div>
        ))}
      </div>

      {stats.brands.length ? (
        <div className="mt-4 space-y-2">
          {stats.brands.map((row) => (
            <div key={row.brand} className="flex items-center gap-2">
              <span className="w-24 truncate text-xs font-medium">{row.brand}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(6, (row.count / maxBrand) * 100)}%` }}
                />
              </span>
              <span className="w-5 text-right text-xs font-semibold text-muted-foreground">{row.count}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {stats.brandsFailed ? 'Brand counts are unavailable right now.' : 'No brands on the lot yet.'}
        </p>
      )}
    </section>
  );
}