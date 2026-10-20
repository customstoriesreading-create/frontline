export function vehicleTitle(vehicle) {
  if (!vehicle) return 'Untitled vehicle';
  return [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Untitled vehicle';
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Selling a vehicle stamps the sale date and figures; moving it back off sold
 * clears them so the money insight only counts real sales.
 */
export function salePatch(vehicle, nextStatus, price) {
  if (nextStatus !== 'sold') {
    return { status: nextStatus, sold_date: null, sold_price: null };
  }
  const asking = price === undefined ? vehicle?.price ?? null : price;
  return {
    status: 'sold',
    sold_date: vehicle?.sold_date || todayKey(),
    sold_price: vehicle?.sold_price ?? asking ?? null,
  };
}