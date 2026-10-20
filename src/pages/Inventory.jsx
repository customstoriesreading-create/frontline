import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Car, Loader2, Plus } from 'lucide-react';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import StockSummary from '@/components/inventory/StockSummary';
import { loadLotStats } from '@/lib/lotStats';
import VehicleCard from '@/components/inventory/VehicleCard';

const PAGE_SIZE = 12;
const SEARCH_FIELDS = ['brand', 'model', 'submodel', 'color', 'vin', 'license_plate'];

function buildQuery({ search, status, brand, color }) {
  const query = {};
  if (status !== 'all') query.status = status;
  if (brand !== 'all') query.brand = brand;
  if (color !== 'all') query.color = color;
  const term = search.trim();
  if (term) {
    query.$or = SEARCH_FIELDS.map((field) => ({ [field]: { $regex: term, $options: 'i' } }));
  }
  return query;
}

export default function Inventory() {
  const [filters, setFilters] = useState({ search: '', status: 'all', brand: 'all', color: 'all' });
  const [searchInput, setSearchInput] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => (current.search === searchInput ? current : { ...current, search: searchInput }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadLotStats().then((stats) => setBrands(stats.brands.map((row) => row.brand)));
    base44.entities.Vehicle.list({ distinct: 'color' }).then(({ items }) =>
      setColors((items || []).filter(Boolean).sort())
    );
  }, []);

  useEffect(() => {
    let active = true;
    const query = buildQuery(filters);
    setLoading(true);
    Promise.all([
      base44.entities.Vehicle.filter(query, { sort: '-created_date', limit: PAGE_SIZE }),
      base44.entities.Vehicle.count(query),
    ]).then(([page, count]) => {
      if (!active) return;
      setVehicles(page.items || []);
      setCursor(page.next_cursor || null);
      setHasMore(Boolean(page.has_more));
      setTotal(count);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [filters]);

  const loadMore = async () => {
    setLoadingMore(true);
    const page = await base44.entities.Vehicle.filter(buildQuery(filters), {
      sort: '-created_date',
      limit: PAGE_SIZE,
      cursor,
    });
    setVehicles((current) => [...current, ...(page.items || [])]);
    setCursor(page.next_cursor || null);
    setHasMore(Boolean(page.has_more));
    setLoadingMore(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading the lot…' : `${total ?? 0} vehicle${total === 1 ? '' : 's'} on the lot`}
          </p>
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link to="/vehicles/new">
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </Button>
      </div>

      <StockSummary />

      <InventoryFilters
        values={filters}
        searchInput={searchInput}
        onSearchInput={setSearchInput}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        brands={brands}
        colors={colors}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="aspect-[4/3] animate-pulse rounded-[var(--radius)] bg-muted" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="surface px-6 py-12 text-center">
          <Car className="mx-auto h-7 w-7 text-muted-foreground" />
          <p className="mt-3 font-heading text-base font-semibold">No vehicles match</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another search, or add the first one.</p>
          <Button asChild className="mt-5 rounded-full">
            <Link to="/vehicles/new">Add a vehicle</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}

      {hasMore && !loading ? (
        <Button variant="secondary" onClick={loadMore} disabled={loadingMore} className="w-full rounded-full">
          {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Load more
        </Button>
      ) : null}
    </div>
  );
}