import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Flag, HeartHandshake, ShieldCheck, UserRound } from 'lucide-react';
import { REPORT_EMAIL, getPublicAppeal, publicAppealUrl } from '@/features/aid/api';
import { formatXof, progressPercent } from '@/features/aid/format';
import { AppealClient } from '@/features/aid/components/AppealClient';
import { PublicHeader } from '@/features/aid/components/PublicHeader';

// Données vivantes (montant collecté, contributions) : pas de rendu statique.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { code: string };
}

// generateMetadata et la page appellent tous deux getPublicAppeal : avec l'API
// (fetch), Next déduplique la requête pendant le rendu.
const loadAppeal = getPublicAppeal;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await loadAppeal(params.code);
  if (!data) {
    return { title: 'Cagnotte introuvable', robots: { index: false, follow: false } };
  }
  const { appeal } = data;
  const percent = progressPercent(appeal.collectedAmount, appeal.goalAmount);
  const title = appeal.title;
  const description = `Pour ${appeal.beneficiaryName} : ${formatXof(appeal.collectedAmount)} collectés sur ${formatXof(
    appeal.goalAmount,
  )} (${percent} %). Contribuez en quelques secondes par Orange Money, Moov Money ou Wave.`;
  const url = publicAppealUrl(appeal.code);
  const images = appeal.beneficiaryPhoto
    ? [{ url: appeal.beneficiaryPhoto, alt: appeal.beneficiaryName }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    // Lien partagé en privé (WhatsApp…) : aperçu oui, indexation par les moteurs non.
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      locale: 'fr_BF',
      siteName: 'Venega',
      url,
      title,
      description,
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images?.map((i) => i.url),
    },
  };
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.charAt(0) ?? '') + (parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : '')).toUpperCase();
}

export default async function PublicAppealPage({ params }: PageProps) {
  const data = await loadAppeal(params.code);
  if (!data) notFound();

  const { appeal, contributions } = data;
  const reportHref = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(
    `Signalement cagnotte ${appeal.code}`,
  )}`;

  return (
    <>
      <div className="border-b border-[#E5E7EB]">
        <PublicHeader />
      </div>

      <main className="mx-auto max-w-[560px] space-y-6 pb-32 md:pb-12 sm:pt-4">
        {/* Couverture */}
        <div className="h-[220px] overflow-hidden bg-[#E4F0EB] sm:rounded-[20px]">
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

        <div className="space-y-6 px-4">
          {/* Titre */}
          <header>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                appeal.status === 'ACTIVE' ? 'bg-[#E4F0EB] text-primary-dark' : 'bg-[#F4F5F7] text-[#5B6B65]'
              }`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${appeal.status === 'ACTIVE' ? 'bg-primary' : 'bg-[#5B6B65]'}`}
              />
              {appeal.status === 'ACTIVE' ? 'En cours' : 'Terminée'}
            </span>
            <h1 className="mt-2.5 break-words text-[24px] font-bold leading-tight text-[#12261E] [font-family:inherit]">
              {appeal.title}
            </h1>
            <ul className="mt-3 space-y-2 text-[15px] text-[#5B6B65]">
              <li className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E4F0EB] text-[12px] font-semibold text-primary-dark"
                >
                  {initials(appeal.beneficiaryName)}
                </span>
                <span>
                  Pour <span className="font-semibold text-[#12261E]">{appeal.beneficiaryName}</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F5F7]">
                  <UserRound size={16} />
                </span>
                <span>Organisée par {appeal.organizerName}</span>
              </li>
            </ul>
          </header>

          <AppealClient
            appeal={appeal}
            initialContributions={contributions}
            renderedAt={Date.now()}
            shareUrl={publicAppealUrl(appeal.code)}
          />

          {/* Confiance */}
          <section className="rounded-[14px] bg-[#E4F0EB]/60 p-4">
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-primary">
                <ShieldCheck size={20} aria-hidden />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-[#12261E]">Versement contrôlé</p>
                <p className="mt-1 text-[14px] text-[#5B6B65]">
                  Les fonds sont versés au bénéficiaire après validation par les approbateurs désignés
                  {appeal.approversRequired > 0 ? ` (${appeal.approversRequired})` : ''}.
                </p>
              </div>
            </div>
            <a
              href={reportHref}
              className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#5B6B65] underline-offset-2 hover:text-[#12261E] hover:underline"
            >
              <Flag size={15} aria-hidden />
              Signaler cette cagnotte
            </a>
          </section>

          <footer className="pt-2 text-center text-[13px] text-[#5B6B65]">
            <p>
              <Link href="/" className="font-semibold text-primary-dark hover:underline">
                Venega
              </Link>{' '}
              — tontine et solidarité, au Burkina Faso.
            </p>
            <p className="mt-1">© {new Date().getFullYear()} Venega. Paiements Mobile Money sécurisés.</p>
          </footer>
        </div>
      </main>
    </>
  );
}
