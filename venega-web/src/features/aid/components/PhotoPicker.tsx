'use client';

import { useId, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { readImageFile } from '@/features/circles/components/create/pickImage';

/**
 * Tuile « Ajouter une photo » (galerie du téléphone ou fichier sur ordinateur),
 * avec aperçu et bouton pour retirer la photo. Même rôle que l'ImagePicker mobile.
 */
export function PhotoPicker({
  value,
  onChange,
  hint,
  label = 'Ajouter une photo',
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  hint: string;
  label?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      setError('');
      onChange(await readImageFile(file));
    } catch {
      setError('Cette image n’a pas pu être lue. Choisissez une photo JPEG ou PNG.');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {value ? (
        <div className="relative h-[180px] overflow-hidden rounded-[20px] border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Photo choisie" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Retirer la photo"
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 text-white hover:bg-ink/75"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex h-[160px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[20px] border border-dashed border-line-strong bg-white px-4 text-center hover:bg-fill"
        >
          <span aria-hidden className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-primary-tint text-primary">
            <ImagePlus size={22} strokeWidth={1.8} />
          </span>
          <span className="text-[15px] font-semibold text-ink">{label}</span>
          <span className="text-[13px] text-muted">{hint}</span>
        </label>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
