'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Largeur sur ordinateur. */
  size?: 'md' | 'lg';
}

/**
 * Équivalent web de la `Sheet` mobile : feuille collée en bas sur téléphone,
 * fenêtre centrée sur ordinateur. Échap et clic sur le fond ferment.
 */
export function Sheet({ open, onClose, title, children, size = 'md' }: SheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div aria-hidden className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-t-[24px] bg-white px-5 pb-6 pt-3 outline-none md:rounded-[24px] md:pt-5 ${
          size === 'lg' ? 'md:max-w-xl' : 'md:max-w-md'
        }`}
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong md:hidden" />
        <div className="mb-3 flex items-start justify-between gap-3">
          {title ? (
            <h2 id={titleId} className="text-[17px] font-bold text-ink">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-fill hover:text-ink"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
