'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle2, FileText, Loader2, Lock, ShieldCheck, Upload } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { btnPrimary, btnSecondary, card, label } from '@/components/ui/classes';
import { IconTile } from '@/components/ui/misc';

/** Écran 1 — présentation de la vérification d'identité. */
export function KycIntroView() {
  return (
    <>
      <PageHeader title="Vérification d'identité" backHref="/profile" />
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6">
        <section className={`${card} p-5 text-center`}>
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint text-primary">
            <ShieldCheck size={28} aria-hidden />
          </span>
          <h2 className="text-[20px] font-bold text-ink">Vérifiez votre identité</h2>
          <p className="mx-auto mt-1 max-w-sm text-[15px] text-muted">
            Pour protéger les cotisations et la confiance de votre cercle, votre identité doit être vérifiée. Cela
            prend deux minutes.
          </p>

          <ul className="mt-5 divide-y divide-line rounded-[14px] border border-line text-left">
            <li className="flex items-center gap-3 p-4">
              <IconTile icon={FileText} size={38} />
              <div>
                <p className="text-[15px] font-semibold text-ink">Pièce d&apos;identité</p>
                <p className="text-[13px] text-muted">CNIB ou passeport, recto et verso</p>
              </div>
            </li>
            <li className="flex items-center gap-3 p-4">
              <IconTile icon={Camera} size={38} />
              <div>
                <p className="text-[15px] font-semibold text-ink">Selfie</p>
                <p className="text-[13px] text-muted">Pour vérifier que c&apos;est bien vous</p>
              </div>
            </li>
          </ul>
        </section>

        <div className="space-y-2.5">
          <Link href="/kyc/upload" className={btnPrimary}>
            Commencer la vérification
          </Link>
          <Link href="/dashboard" className={btnSecondary}>
            Plus tard
          </Link>
        </div>
      </div>
    </>
  );
}

/** Écran 2 — envoi de la CNIB et du selfie. */
export function KycUploadView() {
  const router = useRouter();
  const [cnibFront, setCnibFront] = useState<File | null>(null);
  const [cnibBack, setCnibBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const complete = !!cnibFront && !!cnibBack && !!selfie;

  const handleSubmit = () => {
    if (!complete) return;
    setLoading(true);
    // TODO: envoi des documents à l'API Venega (stockage chiffré) — démo locale ici.
    setTimeout(() => {
      setLoading(false);
      router.push('/kyc/success');
    }, 1200);
  };

  return (
    <>
      <PageHeader title="Vérification d'identité" subtitle="Documents" backHref="/kyc/intro" />
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6">
        <p className="flex items-start gap-2.5 rounded-[14px] bg-primary-tint p-3.5 text-[14px] text-primary-dark">
          <Lock size={17} className="mt-0.5 shrink-0" aria-hidden />
          Vos documents sont chiffrés et ne sont jamais montrés aux autres membres.
        </p>

        <section className={`${card} space-y-4 p-5`}>
          <UploadRow label="CNIB — recto" hint="Face avant, bien lisible" file={cnibFront} onChange={setCnibFront} />
          <UploadRow label="CNIB — verso" hint="Face arrière" file={cnibBack} onChange={setCnibBack} />

          <div>
            <p className={label}>Selfie</p>
            <label
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed p-6 text-center transition-colors ${
                selfie ? 'border-primary bg-[#F0F7F4]' : 'border-line-strong bg-white hover:bg-fill'
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-tint text-primary-dark">
                {selfie ? <CheckCircle2 size={24} aria-hidden /> : <Camera size={24} aria-hidden />}
              </span>
              <span className="text-[15px] font-semibold text-ink">{selfie ? 'Selfie ajouté' : 'Prendre un selfie'}</span>
              <span className="max-w-full truncate text-[13px] text-muted">
                {selfie ? selfie.name : 'Visage bien éclairé, au centre'}
              </span>
              <input
                type="file"
                accept="image/*"
                capture="user"
                className="sr-only"
                onChange={(e) => setSelfie(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </section>

        <div className="space-y-2.5">
          <button type="button" onClick={handleSubmit} disabled={!complete || loading} className={btnPrimary}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden />
                Envoi en cours…
              </>
            ) : (
              'Envoyer pour vérification'
            )}
          </button>
          <Link href="/dashboard" className={btnSecondary}>
            Plus tard
          </Link>
        </div>
      </div>
    </>
  );
}

function UploadRow({
  label: text,
  hint,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <p className={label}>{text}</p>
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-[14px] border p-4 transition-colors ${
          file ? 'border-primary bg-[#F0F7F4]' : 'border-line bg-white hover:bg-fill'
        }`}
      >
        <IconTile icon={file ? CheckCircle2 : FileText} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-ink">{file ? 'Photo ajoutée' : 'Ajouter une photo'}</p>
          <p className="truncate text-[13px] text-muted">{file ? file.name : hint}</p>
        </div>
        <Upload size={17} className="shrink-0 text-muted" aria-hidden />
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}

/** Écran 3 — confirmation. */
export function KycSuccessView() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-10">
      <section className={`${card} w-full p-6 text-center`}>
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint text-primary">
          <CheckCircle2 size={30} aria-hidden />
        </span>
        <h1 className="text-[20px] font-bold text-ink">Identité vérifiée</h1>
        <p className="mx-auto mt-1 max-w-sm text-[15px] text-muted">
          Vous pouvez maintenant créer des cercles, inviter des membres et utiliser toutes les fonctions de Venega.
        </p>
        <Link href="/dashboard" className={`${btnPrimary} mt-5`}>
          Continuer
        </Link>
      </section>
    </div>
  );
}
