import React, { useEffect, useState } from 'react';
import { vehicleAggregate } from '@/lib/insight';
import DayPanel from '@/components/insight/DayPanel';
import { formatCurrency, formatMonthTitle } from '@/lib/format';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function dayKeyOf(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function RevenueCalendar() {
  const today = new Date();
  const [monthDate, setMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [soldByDay, setSoldByDay] = useState(null);
  const [allTime, setAllTime] = useState(null);
  const [selected, setSelected] = useState(dayKeyOf(today.getFullYear(), today.getMonth(), today.getDate()));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    vehicleAggregate({
      query: { status: 'sold' },
      dateBucket: { field: 'sold_date', unit: 'day' },
      sum: ['sold_price'],
    }).then((dayRows) => {
      if (!active) return;
      const map = {};
      let total = 0;
      (dayRows.rows || []).forEach((row) => {
        if (!row.sold_date) return;
        const revenue = row.sum_sold_price || 0;
        map[String(row.sold_date).slice(0, 10)] = { count: row.count, revenue };
        total += revenue;
      });
      setSoldByDay(map);
      setAllTime(total);
    }).catch(() => {
      setSoldByDay({});
      setFailed(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dayKeyOf(today.getFullYear(), today.getMonth(), today.getDate());
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  const monthRevenue = Object.entries(soldByDay || {})
    .filter(([key]) => key.startsWith(monthPrefix))
    .reduce((sum, [, value]) => sum + value.revenue, 0);

  const shiftMonth = (delta) => setMonthDate(new Date(year, month + delta, 1));

  return (
    <section className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Money</p>
          <p className="mt-1 font-heading text-2xl font-semibold tracking-tight">
            {allTime === null ? '—' : formatCurrency(allTime) || '$0'}
          </p>
          <p className="text-xs text-muted-foreground">made from every sale</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="chip grid h-9 w-9 place-items-center text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="chip grid h-9 w-9 place-items-center text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="font-heading text-sm font-semibold tracking-tight">{formatMonthTitle(monthDate)}</p>
        <p className="text-xs text-muted-foreground">
          {soldByDay === null ? '…' : formatCurrency(monthRevenue, { compact: true }) || '$0'} this month
        </p>
      </div>

      {failed ? (
        <p className="mt-2 text-xs text-muted-foreground">Money totals are unavailable right now.</p>
      ) : null}

      {soldByDay ? (
        <>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {WEEKDAYS.map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: firstWeekday }).map((_, index) => (
              <span key={`pad-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const key = dayKeyOf(year, month, day);
              const entry = soldByDay[key];
              const isSelected = key === selected;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={`flex h-12 flex-col items-center justify-center rounded-[calc(var(--radius)*0.55)] text-xs transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : entry
                        ? 'bg-primary/12 text-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className={`font-semibold ${key === todayKey && !isSelected ? 'underline' : ''}`}>{day}</span>
                  {entry ? (
                    <span className={`text-[9px] ${isSelected ? '' : 'text-primary'}`}>
                      {formatCurrency(entry.revenue, { compact: true })}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="mt-3 h-40 w-full animate-pulse rounded-[var(--radius)] bg-muted" />
      )}

      <DayPanel dayKey={selected} />
    </section>
  );
}