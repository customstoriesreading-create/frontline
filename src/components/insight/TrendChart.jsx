import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { vehicleAggregate } from '@/lib/insight';

const MONTHS = 6;

function monthSeries() {
  const series = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let index = MONTHS - 1; index >= 0; index -= 1) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - index, 1);
    series.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      added: 0,
    });
  }
  return series;
}

export default function TrendChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    vehicleAggregate({ dateBucket: { field: 'created_date', unit: 'day' } })
      .then((result) => {
        if (!active) return;
        const series = monthSeries();
        (result.rows || []).forEach((row) => {
          if (!row.created_date) return;
          const bucket = series.find((entry) => entry.key === String(row.created_date).slice(0, 7));
          if (bucket) bucket.added += row.count;
        });
        setData(series);
      })
      .catch(() => setData([]));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Trend · last {MONTHS} months
        </p>
        <p className="text-xs text-muted-foreground">Vehicles added</p>
      </div>
      <div className="mt-3 h-52 w-full">
        {data === null ? (
          <div className="h-full w-full animate-pulse rounded-[var(--radius)] bg-muted" />
        ) : data.length === 0 ? (
          <p className="pt-8 text-center text-sm text-muted-foreground">
            Trends are unavailable right now.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="added" name="Added" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}