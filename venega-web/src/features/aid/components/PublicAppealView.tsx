import Link from 'next/link';
import { Flag, HeartHandshake, ShieldCheck, UserRound } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { REPORT_EMAIL, publicAppealUrl } from '../api';
import type { PublicAppealData } from '../types';
import { AppealClient } from './AppealClient';
import { PublicHeader } from './PublicHeader';

/**
 * Page publique d'une cagnotte (/c/[code]) : ouverte depuis le lien partagé,
 * sans compte. Même contenu que l'écran mobile aid/[id] : couverture, titre,
 * bénéficiaire, collecte, histoire, contribution, contributeurs.
 */
export function PublicAppealView({ data, renderedAt }: { data: PublicAppealData; renderedAt: number }) {
  const { appeal, contributions } = data;
  const active = appeal.status === 'ACTIVE';
  const reportHref = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(`Signalement cagnotte ${appeal.code}`)}`;

  return (
    <>
      <div className="border-b border-line">
        <PublicHeader />
      </div>

      <main className="mx-auto max-w-[560px] pb-32 sm:pt-4 md:pb-12">
        <div className="h-[220px] overflow-hidden bg-primary-tint sm:rounded-[20px]">
          {appeal.beneficiaryPhoto ? (
            // Image distante (API) : <img> simple, sans dépendre des domaines autorisés de next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={appeal.beneficiaryPhoto}
              alt={`Photo de ${appeal.beneficiaryName}`}
              width={560}
              height={220}
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary">
              <HeartHandshake size={64} strokeWidth={1.5} aria-hidden />
            </div>
          )}
        </div>

        <div className="space-y-6 px-4 pt-5">
          <header>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                active ? 'bg-primary-tint text-primary-dark' : 'bg-fill text-muted'
              }`}
            >
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-primary' : 'bg-muted'}`} />
              {active ? 'En cours' : 'Terminée'}
            </span>
            <h1 className="mt-2.5 break-words text-[22px] font-bold leading-tight text-ink">{appeal.title}</h1>
            <ul className="mt-3 space-y-2 text-[15px] text-muted">
              <li className="flex items-center gap-2.5">
                <Avatar name={appeal.beneficiaryName} uri={appeal.beneficiaryPhoto} size={32} />
                <span>
                  Pour <span className="font-semibold text-ink">{appeal.beneficiaryName}</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fill">
                  <UserRound size={16} />
                </span>
                <span>Organisée par {appeal.organizerName}</span>
              </li>
            </ul>
          </header>

          <AppealClient
            appeal={appeal}
            initialContributions={contributions}
            renderedAt={renderedAt}
            shareUrl={publicAppealUrl(appeal.code)}
          />

          <section className="rounded-[14px] bg-primary-tint p-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={18} className="mt-px shrink-0 text-primary" aria-hidden />
              <p className="text-[13px] text-primary-dark">
                Les fonds sont conservés sur le compte sécurisé Venega et reversés à {appeal.beneficiaryName} uniquement
                après validation des approbateurs du cercle.
              </p>
            </div>
            <a
              href={reportHref}
              className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              <Flag size={15} aria-hidden />
              Signaler cette cagnotte
            </a>
          </section>

          <footer className="pt-2 text-center text-[13px] text-muted">
            <Link href="/" className="font-semibold text-primary-dark hover:underline">
              Venega
            </Link>{' '}
            — tontine et caisse de solidarité.
          </footer>
        </div>
      </main>
    </>
  );
}
