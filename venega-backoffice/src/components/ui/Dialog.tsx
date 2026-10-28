'use client';

import React, { useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg';
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col rounded-t-lg border border-line bg-white sm:rounded-lg',
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md',
        )}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description && <div className="mt-1 text-sm text-ink-muted">{description}</div>}
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-ink-muted hover:bg-canvas hover:text-ink" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        {children && <div className="overflow-y-auto px-5 py-4">{children}</div>}
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * Confirmation d'une action avec motif (obligatoire ou facultatif).
 * Les motifs prédéfinis remplissent le champ ; le texte reste modifiable.
 */
export function ReasonDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  tone = 'primary',
  required = true,
  minLength = 5,
  presets,
  label = 'Motif',
  placeholder = 'Expliquez la raison de cette décision…',
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  required?: boolean;
  minLength?: number;
  presets?: readonly string[];
  label?: string;
  placeholder?: string;
  loading?: boolean;
  error?: string | null;
}) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const fieldId = useId();

  useEffect(() => {
    if (open) {
      setReason('');
      setTouched(false);
    }
  }, [open]);

  const tooShort = required && reason.trim().length < minLength;
  const submit = () => {
    setTouched(true);
    if (!tooShort) onConfirm(reason.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? () => undefined : onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={submit} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {presets && presets.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setReason(p)}
              className={cn(
                'rounded-md border px-2 py-1 text-sm',
                reason === p ? 'border-brand bg-brand-tint text-brand' : 'border-line text-ink-soft hover:border-brand-line',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <label htmlFor={fieldId} className="mb-1 block text-sm font-medium text-ink">
        {label} {required ? <span className="text-danger">*</span> : <span className="font-normal text-ink-muted">(facultatif)</span>}
      </label>
      <textarea
        id={fieldId}
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        className={cn(
          'w-full resize-y rounded-md border bg-white px-3 py-2 text-base text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2',
          touched && tooShort ? 'border-danger focus:ring-danger/15' : 'border-line focus:border-brand focus:ring-brand/15',
        )}
      />
      {touched && tooShort && <p className="mt-1 text-sm text-danger">Motif obligatoire ({minLength} caractères minimum).</p>}
      {error && <p className="mt-2 rounded-md border border-danger-line bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>}
    </Dialog>
  );
}
