import React from 'react';

export default function FormField({ label, required = false, error, hint, children }) {
  return (
    <div className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}