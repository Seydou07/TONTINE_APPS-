'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';

export interface ViewerImage {
  src: string;
  label: string;
}

/** Vignette cliquable qui ouvre la visionneuse. */
export function ImageThumb({ image, onOpen }: { image: ViewerImage; onOpen: () => void }) {
  return (
    <figure className="min-w-0">
      <button
        type="button"
        onClick={onOpen}
        className="group relative block aspect-[1.58] w-full overflow-hidden rounded-md border border-line bg-canvas"
        aria-label={`Agrandir : ${image.label}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.label} className="h-full w-full object-contain" loading="lazy" />
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-white/95 px-1.5 py-0.5 text-xs font-medium text-ink-soft opacity-90 group-hover:opacity-100">
          <Maximize2 size={12} /> Agrandir
        </span>
      </button>
      <figcaption className="mt-1.5 text-sm font-medium text-ink-soft">{image.label}</figcaption>
    </figure>
  );
}

/** Visionneuse plein écran : zoom, rotation (photo prise de travers), navigation clavier. */
export function ImageViewer({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: ViewerImage[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const open = index !== null;
  const current = index !== null ? images[index] : undefined;

  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index !== null) onIndex((index + 1) % images.length);
      if (e.key === 'ArrowLeft' && index !== null) onIndex((index - 1 + images.length) % images.length);
      if (e.key === '+') setZoom((z) => Math.min(4, z + 0.5));
      if (e.key === '-') setZoom((z) => Math.max(1, z - 0.5));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, index, images.length, onClose, onIndex]);

  if (!open || !current || index === null) return null;

  const tool = 'inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-ink-soft hover:text-brand';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-ink/90" role="dialog" aria-modal="true" aria-label={current.label}>
      <div className="flex items-center gap-2 bg-white px-4 py-2">
        <p className="min-w-0 flex-1 truncate text-base font-medium text-ink">
          {current.label} <span className="text-ink-muted">· {index + 1}/{images.length}</span>
        </p>
        <button type="button" className={tool} onClick={() => setZoom((z) => Math.max(1, z - 0.5))} aria-label="Dézoomer">
          <ZoomOut size={16} />
        </button>
        <span className="w-12 text-center text-sm text-ink-muted">{Math.round(zoom * 100)} %</span>
        <button type="button" className={tool} onClick={() => setZoom((z) => Math.min(4, z + 0.5))} aria-label="Zoomer">
          <ZoomIn size={16} />
        </button>
        <button type="button" className={tool} onClick={() => setRotation((r) => (r + 90) % 360)} aria-label="Pivoter">
          <RotateCw size={16} />
        </button>
        <button type="button" className={tool} onClick={onClose} aria-label="Fermer">
          <X size={16} />
        </button>
      </div>
      <div className="relative flex-1 overflow-auto" onClick={onClose}>
        <div className="flex min-h-full min-w-full items-center justify-center p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt={current.label}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] max-w-full rounded bg-white transition-transform"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transformOrigin: 'center' }}
          />
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndex((index - 1 + images.length) % images.length);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 text-ink"
              aria-label="Image précédente"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndex((index + 1) % images.length);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 text-ink"
              aria-label="Image suivante"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
