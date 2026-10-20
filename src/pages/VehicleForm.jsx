import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import FormField from '@/components/vehicle/FormField';
import PhotoUploader from '@/components/vehicle/PhotoUploader';
import useCurrentUser from '@/hooks/useCurrentUser';
import { logActivity } from '@/lib/activity';
import { salePatch, vehicleTitle } from '@/lib/vehicles';
import { invalidateLotStats } from '@/lib/lotStats';

const INPUT = 'field h-11 px-3.5 text-sm';
const AREA = 'field min-h-[96px] px-3.5 py-3 text-sm';

const EMPTY = {
  brand: '',
  model: '',
  submodel: '',
  additional_info: '',
  color: '',
  license_plate: '',
  vin: '',
  price: '',
  previous_crash: false,
  crash_details: '',
  previous_owners: '',
  previous_owner_details: '',
  status: 'available',
};

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const { user, accessLevel } = useCurrentUser();

  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotos] = useState([]);
  const [original, setOriginal] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    base44.entities.Vehicle.get(id).then((vehicle) => {
      setOriginal(vehicle);
      setForm({
        ...EMPTY,
        ...vehicle,
        price: vehicle.price ?? '',
        previous_owners: vehicle.previous_owners ?? '',
      });
      setPhotos(vehicle.photos || []);
      setLoading(false);
    });
  }, [editing, id]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (photos.length === 0) nextErrors.photos = 'Add at least one photo of the vehicle.';
    if (!form.brand.trim()) nextErrors.brand = 'Brand is required.';
    if (!form.model.trim()) nextErrors.model = 'Model is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const price = form.price === '' ? null : Number(form.price);
    const payload = {
      photos,
      main_photo: photos[0],
      brand: form.brand.trim(),
      model: form.model.trim(),
      submodel: form.submodel.trim(),
      additional_info: form.additional_info.trim(),
      color: form.color.trim(),
      license_plate: form.license_plate.trim(),
      vin: form.vin.trim(),
      price,
      previous_crash: form.previous_crash,
      crash_details: form.previous_crash ? form.crash_details.trim() : '',
      previous_owners: Number(form.previous_owners) || 0,
      previous_owner_details: form.previous_owner_details.trim(),
      ...salePatch(original, form.status, price),
    };

    try {
      if (editing) {
        await base44.entities.Vehicle.update(id, payload);
        invalidateLotStats();
        await logActivity({
          user,
          accessLevel,
          action: 'vehicle.updated',
          summary: `Updated ${payload.brand} ${payload.model}`,
          targetType: 'vehicle',
          targetId: id,
        });
        navigate(`/vehicles/${id}`);
      } else {
        const created = await base44.entities.Vehicle.create(payload);
        invalidateLotStats();
        await logActivity({
          user,
          accessLevel,
          action: 'vehicle.created',
          summary: `Added ${vehicleTitle(created)} to the lot`,
          targetType: 'vehicle',
          targetId: created.id,
        });
        navigate(`/vehicles/${created.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 w-full animate-pulse rounded-[var(--radius)] bg-muted" />;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link to={editing ? `/vehicles/${id}` : '/'} className="chip inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <h1 className="font-heading text-lg font-semibold tracking-tight">
          {editing ? 'Edit vehicle' : 'New vehicle'}
        </h1>
      </div>

      <div className="surface space-y-3 p-4">
        <div>
          <p className="font-heading text-base font-semibold tracking-tight">Photos</p>
          <p className="text-xs text-muted-foreground">Select several at once — 1 to 15 photos per vehicle.</p>
          {errors.photos ? <p className="mt-1 text-xs font-medium text-destructive">{errors.photos}</p> : null}
        </div>
        <PhotoUploader photos={photos} onChange={setPhotos} />
      </div>

      <div className="surface space-y-4 p-4">
        <p className="font-heading text-base font-semibold tracking-tight">Vehicle</p>
        <FormField label="Brand" required error={errors.brand}>
          <input
            className={INPUT}
            value={form.brand}
            onChange={(event) => set({ brand: event.target.value })}
            placeholder="Toyota"
          />
        </FormField>
        <FormField label="Model" required error={errors.model}>
          <input
            className={INPUT}
            value={form.model}
            onChange={(event) => set({ model: event.target.value })}
            placeholder="Corolla"
          />
        </FormField>
        <FormField label="Submodel">
          <input
            className={INPUT}
            value={form.submodel}
            onChange={(event) => set({ submodel: event.target.value })}
            placeholder="LE sedan"
          />
        </FormField>
        <FormField label="Colour">
          <input
            className={INPUT}
            value={form.color}
            onChange={(event) => set({ color: event.target.value })}
            placeholder="Midnight blue"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Licence plate">
            <input
              className={INPUT}
              value={form.license_plate}
              onChange={(event) => set({ license_plate: event.target.value })}
              placeholder="ABC 1234"
            />
          </FormField>
          <FormField label="VIN">
            <input
              className={INPUT}
              value={form.vin}
              onChange={(event) => set({ vin: event.target.value })}
              placeholder="1HGCM82633A004352"
            />
          </FormField>
        </div>
        <FormField label="Set price" hint="Optional — what you're asking for the vehicle.">
          <input
            className={INPUT}
            type="number"
            min="0"
            step="100"
            inputMode="numeric"
            value={form.price}
            onChange={(event) => set({ price: event.target.value })}
            placeholder="18900"
          />
        </FormField>
        <FormField label="Additional information" hint="Trim, mileage, options, condition…">
          <textarea
            className={AREA}
            value={form.additional_info}
            onChange={(event) => set({ additional_info: event.target.value })}
            placeholder="Full service history, new tyres, tow bar fitted"
          />
        </FormField>
      </div>

      <div className="surface space-y-4 p-4">
        <p className="font-heading text-base font-semibold tracking-tight">History</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Previous crash</p>
            <p className="text-xs text-muted-foreground">Turn on if the vehicle has been in an accident.</p>
          </div>
          <Switch
            checked={form.previous_crash}
            onCheckedChange={(checked) => set({ previous_crash: checked })}
          />
        </div>
        {form.previous_crash ? (
          <FormField label="Crash details">
            <textarea
              className={AREA}
              value={form.crash_details}
              onChange={(event) => set({ crash_details: event.target.value })}
              placeholder="Rear bumper repaired in 2021"
            />
          </FormField>
        ) : null}
        <FormField label="Previous owners">
          <input
            className={INPUT}
            type="number"
            min="0"
            inputMode="numeric"
            value={form.previous_owners}
            onChange={(event) => set({ previous_owners: event.target.value })}
            placeholder="1"
          />
        </FormField>
        <FormField label="Previous owner details">
          <textarea
            className={AREA}
            value={form.previous_owner_details}
            onChange={(event) => set({ previous_owner_details: event.target.value })}
            placeholder="One private owner, trade-in from a lease"
          />
        </FormField>
      </div>

      <div className="surface space-y-3 p-4">
        <p className="font-heading text-base font-semibold tracking-tight">Status</p>
        <Select value={form.status} onValueChange={(value) => set({ status: value })}>
          <SelectTrigger className={`${INPUT} font-medium capitalize`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        {form.status === 'sold' ? (
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Saving as sold stamps the sale date and price for the money insight.
          </p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="h-12 flex-1 rounded-full text-sm font-semibold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {editing ? 'Save changes' : 'Add to inventory'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-12 rounded-full text-sm font-semibold"
          onClick={() => navigate(editing ? `/vehicles/${id}` : '/')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}