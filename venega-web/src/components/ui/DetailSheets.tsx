'use client';

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Sheet } from './Sheet';

export interface TransactionDetailField {
  label: string;
  value: string;
}

/** Détail d'une opération (équivalent de TransactionDetailModal mobile). */
export function TransactionDetailSheet({
  open,
  onClose,
  isCredit,
  name,
  amount,
  fields,
}: {
  open: boolean;
  onClose: () => void;
  isCredit: boolean;
  name: string;
  /** Montant déjà formaté. */
  amount: string;
  fields: TransactionDetailField[];
}) {
  const Icon = isCredit ? ArrowUpRight : ArrowDownLeft;
  return (
    <Sheet open={open} onClose={onClose} title="Détails de l’opération">
      <div className="flex flex-col items-center py-2 text-center">
        <span
          className={`mb-2.5 flex h-11 w-11 items-center justify-center rounded-full ${
            isCredit ? 'bg-primary-tint text-primary' : 'bg-fill text-ink-soft'
          }`}
        >
          <Icon size={20} aria-hidden />
        </span>
        <p className={`text-[22px] font-bold ${isCredit ? 'text-primary' : 'text-ink'}`}>
          {isCredit ? '+' : '−'}
          {amount}
        </p>
        <p className="mt-0.5 text-[15px] text-muted">{name}</p>
      </div>
      <dl className="mt-4 rounded-[20px] border border-line px-4">
        {fields.map((f, i) => (
          <div
            key={f.label}
            className={`flex items-start gap-4 py-3 ${i < fields.length - 1 ? 'border-b border-line' : ''}`}
          >
            <dt className="text-[15px] text-muted">{f.label}</dt>
            <dd className="flex-1 text-right text-[15px] font-medium text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>
      <Button variant="secondary" onClick={onClose} className="mt-5">
        Fermer
      </Button>
    </Sheet>
  );
}

/** Photo de profil en grand (équivalent de AvatarViewerModal mobile). */
export function AvatarViewer({
  open,
  onClose,
  name,
  photoUrl,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  photoUrl?: string;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={name}>
      <div className="flex justify-center py-4">
        <Avatar name={name} uri={photoUrl} size={220} />
      </div>
    </Sheet>
  );
}
