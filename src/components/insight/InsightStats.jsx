import React, { useEffect, useState } from 'react';
import { loadLotStats } from '@/lib/lotStats';

const TILES = [
  { key: 'available', label: 'Available' },
  { key: 'reserved', label: 'Reserved' },
  { key: 'sold', label: 'Sold' },
];

export default function InsightStats() {
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
    return <div className="h-24 w-full animate-pulse rounded-[var(--radius)] bg-muted" />;
  }

  if (state.failed || !state.stats) {
    return (
      <section className="surface p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Stock</p>
        <p className="mt-2 text-sm text-muted-foreground">Counts are unavailable right now.</p>
      </section>
    );
  }

  const { stats } = state;

  return (
    <section className="surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Stock</p>
      <div className="mt-3">
        <p className="font-heading text-3xl font-semibold tracking-tight">{stats.total}</p>
        <p className="text-xs text-muted-foreground">vehicles on the lot</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {TILES.map((tile) => (
          <div key={tile.key} className="rounded-[calc(var(--radius)*0.7)] bg-muted/70 px-2 py-2.5 text-center">
            <p className="font-heading text-lg font-semibold tracking-tight">
              {stats.byStatus[tile.key] || 0}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{tile.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}