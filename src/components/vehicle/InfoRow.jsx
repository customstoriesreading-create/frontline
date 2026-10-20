import React from 'react';

export default function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2.5 last:border-b-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className="max-w-[62%] text-right text-sm font-medium">{value || '—'}</span>
    </div>
  );
}