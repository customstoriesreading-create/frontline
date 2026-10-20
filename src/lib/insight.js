import { base44 } from '@/api/base44Client';

let queue = Promise.resolve();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const BACKOFF = [1200, 3500];

async function attempt(query, retries) {
  try {
    return await base44.entities.Vehicle.aggregate(query);
  } catch (error) {
    if (retries > 0) {
      await wait(BACKOFF[BACKOFF.length - retries] || 3500);
      return attempt(query, retries - 1);
    }
    throw error;
  }
}

/**
 * Counts for the summary and insight screens. They run one at a time and retry
 * with backoff: a page that fires every count at once trips the server's burst
 * limit, and the window needs a moment before it accepts calls again.
 */
export function vehicleAggregate(query) {
  const run = () => attempt(query, BACKOFF.length);
  const next = queue.then(run, run);
  queue = next.then(
    () => {},
    () => {}
  );
  return next;
}