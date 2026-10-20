import React, { useEffect, useState } from 'react';
import { loadLotStats } from '@/lib/lotStats';

export default function BrandBreakdown() {
  const [state, setState] = useState({ loading: true, brands: null, total: 0, failed: false });

  useEffect(() => {
    let active = true;
    loadLotStats()
      .then((stats) => {
        if (active) {
          setState({
            loading: false,
            brands: stats.brands,
            total: stats.total,
            failed: stats.brandsFailed,
          });
        }
      })
      .catch(() => {
        if (active) setState({ loading: false, brands: null, total: 0, failed: true });
      });
    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return <div className="h-32 w-full animate-pulse rounded-[var(--radius)] bg-muted" />;
  }

  return (
    <section className="surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">By brand</p>
      {state.failed || !state.brands ? (
        <p className="mt-3 text-sm text-muted-foreground">Brand counts are unavailable right now.</p>
      ) : state.brands.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nothing on the lot yet.</p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {state.brands.map((row) => (
            <div key={row.brand} className="flex items-center gap-3">
              <span className="w-24 truncate text-sm font-medium">{row.brand}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(5, (row.count / state.total) * 100)}%` }}
                />
              </span>
              <span className="w-16 text-right text-xs text-muted-foreground">
                {row.count} · {Math.round((row.count / state.total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}