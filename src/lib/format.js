const CURRENCY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const COMPACT_CURRENCY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCurrency(value, { compact = false } = {}) {
  if (value === null || value === undefined || value === '') return null;
  const amount = Number(value);
  if (Number.isNaN(amount)) return null;
  return (compact ? COMPACT_CURRENCY : CURRENCY).format(amount);
}

export function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDayStamp(value) {
  if (!value) return '';
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? formatTime(value)
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDayTitle(dayKey) {
  return new Date(`${dayKey}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatMonthTitle(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function initialsFor(name, email) {
  const source = (name || email || '?').trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('') || '?';
}