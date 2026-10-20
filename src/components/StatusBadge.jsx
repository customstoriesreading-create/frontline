import React from 'react';

const STYLES = {
  available: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25',
  reserved: 'bg-amber-500/18 text-amber-700 border-amber-500/30',
  sold: 'bg-slate-500/15 text-slate-600 border-slate-500/25',
};

export default function StatusBadge({ status = 'available', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize backdrop-blur-md ${
        STYLES[status] || STYLES.available
      } ${className}`}
    >
      {status}
    </span>
  );
}