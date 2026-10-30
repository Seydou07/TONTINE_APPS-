'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { btnSecondary } from '@/components/ui/classes';

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  className?: string;
  /** Libellé du bouton (défaut « Partager la cagnotte »). */
  label?: string;
  /** Rendu compact (icône seule, pour un en-tête). */
  iconOnly?: boolean;
}

/** Copie de secours pour les navigateurs sans Clipboard API (anciens Android). */
function legacyCopy(value: string): boolean {
  const el = document.createElement('textarea');
  el.value = value;
  el.setAttribute('readonly', '');
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(el);
  return ok;
}

/** Partage natif (Web Share API) avec repli sur la copie du lien. */
export function ShareButton({ url, title, text, className, label = 'Partager la cagnotte', iconOnly = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleShare() {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // L'utilisateur a fermé la feuille de partage : rien à faire.
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }

    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) ok = legacyCopy(url);

    if (ok) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleShare}
        aria-label={copied ? 'Lien copié' : 'Partager le lien'}
        className={`flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-fill ${className ?? ''}`}
      >
        {copied ? <Check size={20} className="text-primary" aria-hidden /> : <Share2 size={20} aria-hidden />}
        <span className="sr-only" aria-live="polite">
          {copied ? 'Le lien a été copié' : ''}
        </span>
      </button>
    );
  }

  return (
    <button type="button" onClick={handleShare} className={`${btnSecondary} ${className ?? ''}`}>
      {copied ? (
        <>
          <Check size={18} className="text-primary" aria-hidden />
          Lien copié
        </>
      ) : (
        <>
          <Share2 size={18} aria-hidden />
          {label}
        </>
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Le lien a été copié' : ''}
      </span>
    </button>
  );
}
