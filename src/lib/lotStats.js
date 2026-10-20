import { base44 } from '@/api/base44Client';
import { vehicleAggregate } from '@/lib/insight';

const TTL = 60 * 1000;
const STATUSES = ['available', 'reserved', 'sold'];
let cache = null;

/**
 * Status and brand counts for the whole lot, shared by the inventory summary and
 * the insight screens so a page load asks the server for them once. Statuses use
 * the cheap count endpoint; the brand breakdown adds one grouped count, which is
 * optional — the status totals still land if it is unavailable.
 */
export function loadLotStats() {
  const now = Date.now();
  if (cache && now - cache.at < TTL) return cache.promise;

  const promise = Promise.all([
    ...STATUSES.map((status) => base44.entities.Vehicle.count({ status })),
    vehicleAggregate({ groupBy: 'brand' })
      .then((result) => ({
        brands: (result.rows || [])
          .filter((row) => row.brand)
          .map((row) => ({ brand: row.brand, count: row.count }))
          .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand)),
        brandsFailed: false,
      }))
      .catch(() => ({ brands: [], brandsFailed: true })),
  ]).then((results) => {
    const brandPart = results[results.length - 1];
    const byStatus = {};
    STATUSES.forEach((status, index) => {
      byStatus[status] = results[index] || 0;
    });
    return {
      byStatus,
      brands: brandPart.brands,
      brandsFailed: brandPart.brandsFailed,
      total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
    };
  });

  cache = { at: now, promise };
  promise.catch(() => {
    cache = null;
  });
  return promise;
}

/** Called after a vehicle changes so the next look at the lot is up to date. */
export function invalidateLotStats() {
  cache = null;
}