'use client';

import { Fragment, useState } from 'react';
import { FileText, FileX, ShieldCheck, UserCheck, type LucideIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Sheet } from '@/components/ui/Sheet';

/*
 * Documents d'identité d'un membre ou d'un candidat (CNIB recto, verso, selfie)
 * + visionneuse. Copie de MemberDocuments.tsx mobile.
 * TODO API : `GET /circles/:id/members/:userId/documents` → URL signées courtes,
 * réservé au fondateur et journalisé (docs/api-mobile.md, section 3).
 */

export type MemberDocumentKind = 'front' | 'back' | 'selfie';

export interface MemberDocumentsProps {
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  cnibFrontUrl?: string;
  cnibBackUrl?: string;
  selfieUrl?: string;
  /** Titre de section (défaut « Documents ») ; `null` pour le masquer. */
  title?: string | null;
  /** Appelé à chaque ouverture d'un document. */
  onOpen?: (kind: MemberDocumentKind) => void;
  /** Documents déjà consultés (affiche « Consulté »). */
  viewed?: Partial<Record<MemberDocumentKind, boolean>>;
}

export function MemberDocuments({
  fullName,
  phoneNumber,
  avatarUrl,
  cnibFrontUrl,
  cnibBackUrl,
  selfieUrl,
  title = 'Documents',
  onOpen,
  viewed,
}: MemberDocumentsProps) {
  const [open, setOpen] = useState<MemberDocumentKind | null>(null);

  const rows: { kind: MemberDocumentKind; icon: LucideIcon; title: string; sub: string }[] = [];
  if (cnibFrontUrl) rows.push({ kind: 'front', icon: FileText, title: 'CNIB recto', sub: 'Photo, identité et numéro' });
  if (cnibBackUrl) rows.push({ kind: 'back', icon: FileText, title: 'CNIB verso', sub: 'Adresse et détails biométriques' });
  if (selfieUrl) rows.push({ kind: 'selfie', icon: UserCheck, title: 'Selfie', sub: 'Vérification faciale' });

  const handleOpen = (kind: MemberDocumentKind) => {
    setOpen(kind);
    onOpen?.(kind);
  };

  return (
    <div>
      {title && <h2 className="mb-2 px-1 text-[13px] font-semibold text-muted">{title}</h2>}
      {rows.length === 0 ? (
        <div className="flex items-center gap-2.5 rounded-[20px] border border-line bg-white p-4 text-[14px] text-muted">
          <FileX size={20} aria-hidden />
          Aucun document fourni
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-line bg-white">
          {rows.map((r, idx) => {
            const Icon = r.icon;
            return (
              <Fragment key={r.kind}>
                {idx > 0 && <div className="ml-[68px] h-px bg-line" />}
                <button
                  type="button"
                  onClick={() => handleOpen(r.kind)}
                  aria-label={`Voir ${r.title}`}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-fill"
                >
                  <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-tint text-primary">
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">{r.title}</span>
                    <span className={`block text-[13px] ${viewed?.[r.kind] ? 'font-semibold text-primary' : 'text-muted'}`}>
                      {viewed?.[r.kind] ? 'Consulté' : r.sub}
                    </span>
                  </span>
                  <span className="text-[14px] font-semibold text-primary">Voir</span>
                </button>
              </Fragment>
            );
          })}
        </div>
      )}

      <Sheet
        open={open === 'front' || open === 'back'}
        onClose={() => setOpen(null)}
        title={`CNIB — ${open === 'back' ? 'Verso' : 'Recto'}`}
      >
        <div className="rounded-[16px] border border-line bg-white p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-primary-dark" aria-hidden />
            <p className="text-[12px] font-bold tracking-wide text-primary-dark">RÉPUBLIQUE DE BURKINA FASO</p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={fullName} size={64} />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink">{fullName || '—'}</p>
              <p className="text-[13px] text-muted">N° BFA-CNIB-00945271</p>
              <p className="text-[13px] text-muted">Né(e) le 12/04/1990</p>
            </div>
          </div>
          <div className="my-3 h-px bg-line" />
          <p className="text-[13px] text-muted">
            {open === 'back' ? 'Verso — Adresse et détails biométriques' : 'Recto — Photo, identité et numéro'}
          </p>
        </div>
        <p className="mt-3 text-center text-[12px] text-subtle">Aperçu du document simulé pour la démo</p>
      </Sheet>

      <Sheet open={open === 'selfie'} onClose={() => setOpen(null)} title="Selfie">
        <div className="flex flex-col items-center gap-3 py-2">
          <Avatar name={fullName} uri={avatarUrl} size={200} />
          <p className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink">
            <ShieldCheck size={15} className="text-primary" aria-hidden />
            {fullName}
            {phoneNumber ? ` — ${phoneNumber}` : ''}
          </p>
        </div>
        <p className="mt-3 text-center text-[12px] text-subtle">Aperçu du selfie simulé pour la démo</p>
      </Sheet>
    </div>
  );
}
