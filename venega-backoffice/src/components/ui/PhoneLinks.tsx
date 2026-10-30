import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { formatPhone } from '@/lib/format';
import { telHref, whatsappHref } from '@/lib/phone';

/** Numéro cliquable (appel) + lien WhatsApp, pour rappeler l'utilisateur en un geste. */
export function PhoneLinks({ phone, compact }: { phone: string; compact?: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <a href={telHref(phone)} className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-brand hover:underline">
        <Phone size={14} /> {formatPhone(phone)}
      </a>
      <a
        href={whatsappHref(phone)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 text-xs font-medium text-ink-soft hover:border-brand-line hover:text-brand"
        title="Ouvrir une conversation WhatsApp"
      >
        <MessageCircle size={12} /> {compact ? 'WA' : 'WhatsApp'}
      </a>
    </span>
  );
}
