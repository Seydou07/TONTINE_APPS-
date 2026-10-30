'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Check,
  ChevronRight,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Lock,
  ScanFace,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { Sheet } from '@/components/ui/Sheet';
import { ScreenBody, ScreenFooter } from '@/components/ui/blocks';
import { submitKycVerification } from '@/features/circles/store';

/*
 * Vérification d'identité (copie de KycIntroScreen, KycUploadScreen et KycSuccessScreen mobiles).
 * TODO API : chaque photo part sur `POST /uploads` (multipart, ≤ 2 Mo, JPEG/PNG) → { fileId },
 * puis `POST /users/me/kyc` avec les fileId (docs/api-mobile.md, section 6). Ici, les fichiers
 * choisis restent dans le navigateur et ne sont envoyés nulle part.
 */

function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 w-full rounded-[14px] text-[15px] font-semibold text-muted hover:bg-fill hover:text-ink"
    >
      Plus tard
    </button>
  );
}

function LockNote({ children }: { children: string }) {
  return (
    <p className="flex items-start gap-2 px-1 text-[13px] text-muted">
      <Lock size={16} className="mt-px shrink-0" aria-hidden />
      {children}
    </p>
  );
}

/* ── Introduction ── */

export function KycIntroView() {
  const router = useRouter();
  return (
    <>
      <PageHeader title="Vérification d'identité" onBack={() => router.back()} />
      <ScreenBody>
        <div className="pt-2">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint text-primary">
            <ShieldCheck size={28} strokeWidth={1.8} aria-hidden />
          </span>
          <h1 className="mt-4 text-[22px] font-bold text-ink">Vérifiez votre identité</h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Pour sécuriser les cotisations et la confiance de votre cercle, votre identité doit être vérifiée. Cela prend
            environ 2 minutes.
          </p>
        </div>
        <ListGroup title="Ce dont vous aurez besoin">
          <ListRow icon={FileText} tone="primary" title="Pièce d'identité" subtitle="CNIB ou passeport, recto et verso" />
          <ListRow icon={Camera} tone="primary" title="Un selfie" subtitle="Visage bien éclairé, sans lunettes" last />
        </ListGroup>
        <LockNote>Vos documents sont chiffrés et servent uniquement à vérifier votre identité.</LockNote>
        <ScreenFooter>
          <Button onClick={() => router.replace('/kyc/upload')}>Commencer la vérification</Button>
          <SkipButton onClick={() => router.replace('/dashboard')} />
        </ScreenFooter>
      </ScreenBody>
    </>
  );
}

/* ── Envoi des documents ── */

type Target = 'recto' | 'verso' | 'selfie';

function UploadStep({
  icon: Icon,
  title,
  subtitle,
  done,
  onClick,
  last = false,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  done: boolean;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3.5 pl-4 text-left hover:bg-fill">
      <span
        aria-hidden
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
          done ? 'bg-primary text-white' : 'bg-primary-tint text-primary'
        }`}
      >
        {done ? <Check size={20} strokeWidth={2.5} /> : <Icon size={20} strokeWidth={1.8} />}
      </span>
      <span className={`flex min-h-[64px] flex-1 items-center gap-3 py-3 pr-4 ${last ? '' : 'border-b border-line'}`}>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-ink">{title}</span>
          <span className={`block text-[13px] ${done ? 'font-semibold text-primary' : 'text-muted'}`}>{subtitle}</span>
        </span>
        {done ? (
          <span className="text-[14px] font-semibold text-primary">Refaire</span>
        ) : (
          <ChevronRight size={18} className="text-subtle" aria-hidden />
        )}
      </span>
    </button>
  );
}

export function KycUploadView() {
  const router = useRouter();
  const [files, setFiles] = useState<Record<Target, File | null>>({ recto: null, verso: null, selfie: null });
  const [loading, setLoading] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'recto' | 'verso' | null>(null);
  // Cible du prochain fichier choisi (ref : le sélecteur s'ouvre dans le même clic).
  const targetRef = useRef<Target>('recto');
  const cameraRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const doneCount = [files.recto, files.verso, files.selfie].filter(Boolean).length;

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = '';
    const target = targetRef.current;
    if (file && file.type.startsWith('image/')) setFiles((f) => ({ ...f, [target]: file }));
  };

  const choose = (input: HTMLInputElement | null, t: Target) => {
    targetRef.current = t;
    setPickerTarget(null);
    input?.click();
  };

  const handleSubmit = () => {
    if (doneCount < 3) return;
    setLoading(true);
    setTimeout(() => {
      submitKycVerification();
      setLoading(false);
      router.replace('/kyc/success');
    }, 1500);
  };

  return (
    <>
      <PageHeader
        title="Vérification d'identité"
        onBack={() => router.back()}
        right={<span className="text-[14px] font-semibold text-muted">{doneCount}/3</span>}
      />
      <ScreenBody>
        <div>
          <h1 className="text-[22px] font-bold text-ink">Vos documents</h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Ajoutez les deux faces de votre CNIB puis prenez un selfie pour valider votre compte.
          </p>
        </div>

        <ListGroup title="Pièce d'identité">
          <UploadStep
            icon={CreditCard}
            title="CNIB — recto"
            subtitle={files.recto ? 'Photo ajoutée' : 'Face avant, avec votre photo'}
            done={!!files.recto}
            onClick={() => setPickerTarget('recto')}
          />
          <UploadStep
            icon={CreditCard}
            title="CNIB — verso"
            subtitle={files.verso ? 'Photo ajoutée' : 'Face arrière'}
            done={!!files.verso}
            onClick={() => setPickerTarget('verso')}
            last
          />
        </ListGroup>

        <ListGroup title="Selfie">
          <UploadStep
            icon={ScanFace}
            title="Selfie de vérification"
            subtitle={files.selfie ? 'Selfie capturé' : 'Visage centré et bien éclairé'}
            done={!!files.selfie}
            onClick={() => choose(selfieRef.current, 'selfie')}
            last
          />
        </ListGroup>

        <LockNote>Vos documents sont chiffrés et restent strictement confidentiels.</LockNote>

        {/* Sélecteurs de fichiers : caméra arrière, caméra avant (selfie), galerie. */}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={onFile} />
        <input ref={selfieRef} type="file" accept="image/*" capture="user" className="sr-only" tabIndex={-1} aria-hidden onChange={onFile} />
        <input ref={galleryRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={onFile} />

        <ScreenFooter>
          <Button onClick={handleSubmit} loading={loading} disabled={doneCount < 3}>
            Soumettre pour vérification
          </Button>
          <SkipButton onClick={() => router.replace('/dashboard')} />
        </ScreenFooter>
      </ScreenBody>

      <Sheet
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        title={pickerTarget === 'verso' ? 'Ajouter le verso' : 'Ajouter le recto'}
      >
        <ListGroup>
          <ListRow
            icon={Camera}
            tone="primary"
            title="Prendre une photo"
            subtitle="Ouvrir la caméra"
            onClick={() => pickerTarget && choose(cameraRef.current, pickerTarget)}
          />
          <ListRow
            icon={ImageIcon}
            tone="primary"
            title="Importer une image"
            subtitle="Choisir dans la galerie"
            onClick={() => pickerTarget && choose(galleryRef.current, pickerTarget)}
            last
          />
        </ListGroup>
      </Sheet>
    </>
  );
}

/* ── Succès ── */

export function KycSuccessView() {
  const router = useRouter();
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10 text-center">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-tint text-primary">
        <Check size={36} strokeWidth={2.5} aria-hidden />
      </span>
      <h1 className="mt-6 text-[22px] font-bold text-ink">Identité vérifiée</h1>
      <p className="mt-2 text-[15px] text-muted">
        Vous pouvez maintenant créer des cercles, inviter des membres et utiliser toutes les fonctionnalités de Venega.
      </p>
      <Button onClick={() => router.replace('/dashboard')} className="mt-8">
        Continuer
      </Button>
    </div>
  );
}
