'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { btnSecondary } from '../ui';

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  className?: string;
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
export function ShareButton({ url, title, text, className }: ShareButtonProps) {
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
    } else {
      window.prompt('Copiez ce lien :', url);
    }
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
          Partager la cagnotte
        </>
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Le lien a été copié' : ''}
      </span>
    </button>
  );
}
