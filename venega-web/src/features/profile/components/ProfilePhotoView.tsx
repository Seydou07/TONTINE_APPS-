'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDemoStore } from '@/lib/demoStore';
import { getProfile, setAvatarUrl } from '../store';

/** Côté de l'image enregistrée (carrée, recadrée au centre) : léger pour les réseaux lents. */
const PHOTO_SIZE = 320;

/** Lit l'image choisie et la réduit en JPEG carré (data URL). */
function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = PHOTO_SIZE;
      canvas.height = PHOTO_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('canvas'));
        return;
      }
      ctx.drawImage(
        img,
        (img.naturalWidth - side) / 2,
        (img.naturalHeight - side) / 2,
        side,
        side,
        0,
        0,
        PHOTO_SIZE,
        PHOTO_SIZE,
      );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image'));
    };
    img.src = url;
  });
}

/** Photo de profil (copie de ProfilePhotoScreen mobile). */
export function ProfilePhotoView() {
  const router = useRouter();
  useDemoStore();
  const profile = getProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choisissez une image (JPEG ou PNG).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // TODO API: POST /uploads (image ≤ 2 Mo) puis PATCH /users/me avec le fileId (docs/api-mobile.md, section 6).
      setAvatarUrl(await resizeToDataUrl(file));
    } catch {
      setError('Cette image n’a pas pu être lue. Essayez une autre photo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Photo de profil" onBack={() => router.back()} />
      <div className="mx-auto flex max-w-md flex-col items-center px-4 pb-8 pt-10 text-center">
        <Avatar name={profile.name} uri={profile.avatarUrl} size={200} />
        <p className="mt-5 text-[20px] font-bold text-ink">{profile.name}</p>
        <p className="mt-1 text-[14px] text-muted">Visible par les membres de vos cercles</p>

        <div className="mt-8 w-full space-y-3">
          <FormAlert message={error} />
          <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={onFile} tabIndex={-1} aria-hidden />
          <Button icon={Camera} loading={loading} onClick={() => inputRef.current?.click()}>
            Changer la photo
          </Button>
        </div>
      </div>
    </>
  );
}
