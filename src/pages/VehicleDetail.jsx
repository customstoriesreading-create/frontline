import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Pencil, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import PhotoGallery from '@/components/vehicle/PhotoGallery';
import InfoRow from '@/components/vehicle/InfoRow';
import StatusBadge from '@/components/StatusBadge';
import useCurrentUser from '@/hooks/useCurrentUser';
import { logActivity } from '@/lib/activity';
import { formatCurrency } from '@/lib/format';
import { salePatch, vehicleTitle } from '@/lib/vehicles';
import { invalidateLotStats } from '@/lib/lotStats';

const STATUSES = ['available', 'reserved', 'sold'];

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessLevel, permissions, loading: userLoading } = useCurrentUser();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    base44.entities.Vehicle.get(id)
      .then((record) => setVehicle(record))
      .catch(() => setVehicle(null))
      .finally(() => setLoading(false));
  }, [id]);

  const changeStatus = async (next) => {
    if (!vehicle || next === vehicle.status) return;
    setSavingStatus(true);
    try {
      const patch = salePatch(vehicle, next);
      await base44.entities.Vehicle.update(vehicle.id, patch);
      setVehicle((current) => ({ ...current, ...patch }));
      invalidateLotStats();
      await logActivity({
        user,
        accessLevel,
        action: 'vehicle.status',
        summary: `Marked ${vehicleTitle(vehicle)} as ${next}`,
        targetType: 'vehicle',
        targetId: vehicle.id,
      });
    } finally {
      setSavingStatus(false);
    }
  };

  const removeVehicle = async () => {
    await base44.entities.Vehicle.delete(vehicle.id);
    invalidateLotStats();
    await logActivity({
      user,
      accessLevel,
      action: 'vehicle.deleted',
      summary: `Removed ${vehicleTitle(vehicle)} from the lot`,
      targetType: 'vehicle',
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="aspect-[4/3] w-full animate-pulse rounded-[var(--radius)] bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-[var(--radius)] bg-muted" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="surface px-6 py-12 text-center">
        <p className="font-heading text-base font-semibold">Vehicle not found</p>
        <p className="mt-1 text-sm text-muted-foreground">It may have been removed from the lot.</p>
        <Button asChild className="mt-5 rounded-full">
          <Link to="/">Back to inventory</Link>
        </Button>
      </div>
    );
  }

  const title = vehicleTitle(vehicle);
  const canEdit =
    !userLoading && (permissions.editAnyVehicle || !user || vehicle.created_by_id === user.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/"
          className="chip inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Inventory
        </Link>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <Button asChild variant="secondary" size="sm" className="rounded-full">
              <Link to={`/vehicles/${vehicle.id}/edit`}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
          ) : null}
          {permissions.deleteVehicle ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="rounded-full">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove this vehicle?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {title || 'This vehicle'} and its photos will be deleted from the inventory. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction onClick={removeVehicle}>Delete vehicle</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title || 'Untitled vehicle'}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={vehicle.status} />
          {vehicle.submodel ? <span className="text-sm text-muted-foreground">{vehicle.submodel}</span> : null}
          {vehicle.color ? <span className="text-sm text-muted-foreground">· {vehicle.color}</span> : null}
        </div>
      </div>

      <PhotoGallery photos={vehicle.photos || []} title={title} />

      <div className="surface p-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Vehicle</p>
        <InfoRow label="Brand" value={vehicle.brand} />
        <InfoRow label="Model" value={vehicle.model} />
        <InfoRow label="Submodel" value={vehicle.submodel} />
        <InfoRow label="Colour" value={vehicle.color} />
        <InfoRow label="Licence plate" value={vehicle.license_plate} />
        <InfoRow label="VIN" value={vehicle.vin} />
        {formatCurrency(vehicle.price) ? (
          <InfoRow label="Set price" value={formatCurrency(vehicle.price)} />
        ) : null}
        {vehicle.status === 'sold' ? (
          <InfoRow
            label="Sold for"
            value={
              vehicle.sold_price
                ? `${formatCurrency(vehicle.sold_price)}${vehicle.sold_date ? ` · ${vehicle.sold_date}` : ''}`
                : 'Not recorded'
            }
          />
        ) : null}
      </div>

      {vehicle.additional_info ? (
        <div className="surface p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Additional information
          </p>
          <p className="text-sm leading-relaxed">{vehicle.additional_info}</p>
        </div>
      ) : null}

      <div className="surface p-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">History</p>
        <InfoRow label="Previous crash" value={vehicle.previous_crash ? 'Yes' : 'No'} />
        {vehicle.previous_crash ? <InfoRow label="Crash details" value={vehicle.crash_details} /> : null}
        <InfoRow label="Previous owners" value={String(vehicle.previous_owners ?? 0)} />
        <InfoRow label="Owner details" value={vehicle.previous_owner_details} />
      </div>

      <div className="surface p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Set status</p>
          {savingStatus ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {STATUSES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => changeStatus(option)}
              disabled={savingStatus}
              className={`chip px-3 py-2.5 text-xs font-semibold capitalize ${
                vehicle.status === option ? 'chip-active' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}