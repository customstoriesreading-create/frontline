import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';
import { Image } from '@/components/ui/image';
import StatusBadge from '@/components/StatusBadge';

export default function VehicleCard({ vehicle }) {
  const title = [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Untitled vehicle';
  const subtitle = [vehicle.submodel, vehicle.color].filter(Boolean).join(' · ');

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="surface block overflow-hidden transition-transform duration-300 active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {vehicle.main_photo ? (
          <Image src={vehicle.main_photo} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <Car className="h-7 w-7" />
          </div>
        )}
        <span className="absolute right-2 top-2">
          <StatusBadge status={vehicle.status} />
        </span>
      </div>
      <div className="p-3">
        <p className="font-heading text-[15px] font-semibold leading-tight tracking-tight">{title}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{subtitle || 'No further details'}</p>
      </div>
    </Link>
  );
}