import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { appealDescription, getPublicAppeal, publicAppealUrl } from '@/features/aid/api';
import { PublicAppealView } from '@/features/aid/components/PublicAppealView';

// Données vivantes (montant collecté, contributions) : pas de rendu statique.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { code: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getPublicAppeal(params.code);
  if (!data) {
    return { title: 'Cagnotte', robots: { index: false, follow: false } };
  }
  const { appeal } = data;
  const description = appealDescription(appeal);
  const url = publicAppealUrl(appeal.code);
  const images = appeal.beneficiaryPhoto ? [{ url: appeal.beneficiaryPhoto, alt: appeal.beneficiaryName }] : undefined;
  return {
    title: appeal.title,
    description,
    alternates: { canonical: url },
    // Lien partagé en privé (WhatsApp…) : aperçu oui, indexation par les moteurs non.
    robots: { index: false, follow: false },
    openGraph: { type: 'website', locale: 'fr_BF', siteName: 'Venega', url, title: appeal.title, description, images },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title: appeal.title,
      description,
      images: images?.map((i) => i.url),
    },
  };
}

export default async function PublicAppealPage({ params }: PageProps) {
  const data = await getPublicAppeal(params.code);
  if (!data) notFound();
  return <PublicAppealView data={data} renderedAt={Date.now()} />;
}
