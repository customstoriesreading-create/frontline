import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';

export const MAX_PHOTOS = 15;

export default function PhotoUploader({ photos = [], onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');

  const room = MAX_PHOTOS - photos.length;
  const busy = uploading > 0;

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;

    setError('');
    if (room <= 0) {
      setError(`A vehicle can hold up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const batch = files.slice(0, room);
    if (files.length > room) {
      setError(`${room} more photo${room === 1 ? '' : 's'} will fit — ${MAX_PHOTOS} is the limit.`);
    }

    setUploading(batch.length);
    try {
      const uploaded = [];
      for (const file of batch) {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        uploaded.push(file_url);
        setUploading((count) => Math.max(0, count - 1));
      }
      onChange([...photos, ...uploaded]);
    } catch {
      setError('Some photos could not be uploaded. Please try again.');
    } finally {
      setUploading(0);
    }
  };

  const removeAt = (target) => onChange(photos.filter((_, index) => index !== target));
  const makeCover = (target) => onChange([photos[target], ...photos.filter((_, index) => index !== target)]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        {photos.map((photo, index) => (
          <div
            key={`${photo}-${index}`}
            className="relative aspect-square overflow-hidden rounded-[calc(var(--radius)*0.72)] bg-muted"
          >
            <Image src={photo} alt={`Vehicle photo ${index + 1}`} className="h-full w-full object-cover" />
            {index === 0 ? (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                Cover
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(index)}
                className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md"
                aria-label="Use as cover photo"
              >
                <Star className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md"
              aria-label="Remove photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {room > 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="field grid aspect-square place-items-center text-muted-foreground transition active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex flex-col items-center gap-1">
                <ImagePlus className="h-5 w-5" />
                <span className="text-[11px] font-semibold">Add photos</span>
              </span>
            )}
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">
          {photos.length} / {MAX_PHOTOS} photos · at least 1 required
        </span>
        {busy ? <span className="font-medium text-muted-foreground">Uploading…</span> : null}
      </div>

      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  );
}