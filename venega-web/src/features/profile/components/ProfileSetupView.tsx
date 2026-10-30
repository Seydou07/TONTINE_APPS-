'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Check } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import { useDemoStore } from '@/lib/demoStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody } from '@/components/ui/blocks';
import { ApiError, saveDisplayName } from '@/features/auth/api';
import { formatPhone } from '@/features/auth/validation';
import { getProfile } from '../store';

/**
 * Votre profil — après le code SMS, ou depuis « Modifier le profil »
 * (copie de ProfileSetupScreen mobile).
 */
export function ProfileSetupView() {
  const router = useRouter();
  useDemoStore();
  const profile = getProfile();
  const [fullName, setFullName] = useState(profile.name);
  const [email, setEmail] = useState('');
  // TODO API: le numéro Mobile Money et l'e-mail ne sont pas encore dans PATCH /users/me (docs/api-mobile.md, section 2).
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState(profile.phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('Veuillez indiquer votre nom complet.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await saveDisplayName(fullName);
      setShowSuccess(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Le profil n’a pas pu être enregistré.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Votre profil"
        onBack={() => (window.history.length > 1 ? router.back() : router.replace('/dashboard'))}
      />
      <ScreenBody>
        <p className="text-[15px] text-muted">Ces informations apparaissent auprès des membres de vos cercles.</p>

      <div className="relative mx-auto mt-6 w-fit">
        <Avatar name={fullName || profile.name} uri={profile.avatarUrl} size={88} />
        <Link
          href="/profile/photo"
          aria-label="Ajouter une photo de profil"
          className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber text-ink"
        >
          <Camera size={16} aria-hidden />
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        <TextField
          label="Nom complet"
          placeholder="Prénom et nom"
          autoComplete="name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (error) setError('');
          }}
        />
        <TextField
          label="Adresse e-mail"
          placeholder="nom@exemple.com"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint="Facultatif"
        />
        <TextField label="Numéro de téléphone" prefix="+226" value={profile.phone} readOnly hint="Vérifié par SMS" />
        <TextField
          label="Numéro Mobile Money"
          prefix="+226"
          placeholder="70 12 34 56"
          type="tel"
          inputMode="tel"
          maxLength={11}
          value={mobileMoneyNumber}
          onChange={(e) => setMobileMoneyNumber(formatPhone(e.target.value))}
          hint="Utilisé pour vos cotisations et versements"
        />
        <FormAlert message={error} />
        <Button onClick={handleSave} loading={saving}>
          Terminer
        </Button>
      </div>
      </ScreenBody>

      <Sheet open={showSuccess} onClose={() => router.replace('/dashboard')}>
        <div className="flex flex-col items-center pb-5 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-tint text-primary">
            <Check size={24} strokeWidth={2.5} aria-hidden />
          </span>
          <h2 className="mt-3 text-[17px] font-bold text-ink">Compte créé</h2>
          <p className="mt-1 text-[15px] text-muted">Bienvenue dans Venega. Vous pouvez créer ou rejoindre un cercle.</p>
        </div>
        <Button onClick={() => router.replace('/dashboard')}>Commencer</Button>
      </Sheet>
    </>
  );
}
