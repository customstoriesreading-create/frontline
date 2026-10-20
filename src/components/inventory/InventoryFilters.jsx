import React from 'react';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUSES = [
  ['all', 'All'],
  ['available', 'Available'],
  ['reserved', 'Reserved'],
  ['sold', 'Sold'],
];

export default function InventoryFilters({ values, searchInput, onSearchInput, onChange, brands = [], colors = [] }) {
  return (
    <div className="space-y-3">
      <div className="field flex items-center gap-2.5 px-3.5 py-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={searchInput}
          onChange={(event) => onSearchInput(event.target.value)}
          placeholder="Brand, model, VIN or plate"
          className="w-full bg-transparent text-sm outline-none"
          aria-label="Search vehicles"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {STATUSES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange({ status: value })}
            className={`chip shrink-0 px-3.5 py-1.5 text-xs font-semibold ${
              values.status === value ? 'chip-active' : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select value={values.brand} onValueChange={(value) => onChange({ brand: value })}>
          <SelectTrigger className="field h-10 px-3 text-xs font-semibold text-foreground">
            <SelectValue placeholder="Any brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any brand</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={values.color} onValueChange={(value) => onChange({ color: value })}>
          <SelectTrigger className="field h-10 px-3 text-xs font-semibold text-foreground">
            <SelectValue placeholder="Any colour" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any colour</SelectItem>
            {colors.map((color) => (
              <SelectItem key={color} value={color}>
                {color}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}