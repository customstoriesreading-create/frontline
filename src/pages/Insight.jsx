import React from 'react';
import InsightStats from '@/components/insight/InsightStats';
import BrandBreakdown from '@/components/insight/BrandBreakdown';
import TrendChart from '@/components/insight/TrendChart';
import RevenueCalendar from '@/components/insight/RevenueCalendar';
import useCurrentUser from '@/hooks/useCurrentUser';

export default function Insight() {
  const { permissions } = useCurrentUser();
  const full = permissions.insight === 'full';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Insight</h1>
        <p className="text-sm text-muted-foreground">
          {full
            ? 'Stock, brands, trends and the money behind every sale.'
            : 'Stock, brands and trends across the lot.'}
        </p>
      </div>

      <InsightStats />
      <TrendChart />
      <BrandBreakdown />
      {full ? <RevenueCalendar /> : null}
    </div>
  );
}