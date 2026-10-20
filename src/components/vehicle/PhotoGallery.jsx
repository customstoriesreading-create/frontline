import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function PhotoGallery({ photos = [], title = 'Vehicle' }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const total = photos.length;
  if (total === 0) return null;

  const safeIndex = Math.min(index, total - 1);
  const current = photos[safeIndex];
  const step = (delta) => setIndex((value) => (value + delta + total) % total);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="surface relative block aspect-[4/3] w-full overflow-hidden"
        aria-label="Open photos"
      >
        <Image src={current} alt={`${title} photo ${safeIndex + 1}`} className="h-full w-full object-cover" />
        <span className="absolute bottom-2 left-2 grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md">
          <Expand className="h-4 w-4" />
        </span>
        {total > 1 ? (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            {safeIndex + 1} / {total}
          </span>
        ) : null}
      </button>

      {total > 1 ? (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {photos.map((photo, photoIndex) => (
            <button
              key={`${photo}-${photoIndex}`}
              type="button"
              onClick={() => setIndex(photoIndex)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 transition ${
                photoIndex === safeIndex ? 'ring-primary' : 'ring-transparent opacity-75'
              }`}
            >
              <Image src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {expanded ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-4 text-white">
            <span className="text-sm font-medium">
              {safeIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10"
              aria-label="Close photos"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-3">
            <Image
              src={current}
              alt={`${title} photo ${safeIndex + 1}`}
              fittingType="fit"
              className="max-h-[68vh] w-full object-contain"
            />
          </div>
          {total > 1 ? (
            <div className="flex items-center justify-center gap-8 py-8">
              <button
                type="button"
                onClick={() => step(-1)}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="py-8" />
          )}
        </div>
      ) : null}
    </div>
  );
}