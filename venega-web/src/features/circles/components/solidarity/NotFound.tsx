'use client';

import { useRouter } from 'next/navigation';
import { SearchX } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody } from '@/components/ui/blocks';
import { EmptyState } from '@/components/ui/misc';
import { ButtonLink } from '@/components/ui/Button';

/** Écran affiché quand le cercle, le membre ou la demande demandés n'existent pas (ou plus). */
export function NotFoundScreen({
  header,
  title = 'Cercle introuvable',
  text = "Ce cercle n'existe pas ou vous n'en faites plus partie.",
}: {
  header: string;
  title?: string;
  text?: string;
}) {
  const router = useRouter();
  return (
    <>
      <PageHeader title={header} onBack={() => router.back()} />
      <ScreenBody>
        <EmptyState
          icon={SearchX}
          title={title}
          text={text}
          action={
            <ButtonLink href="/circles" variant="secondary">
              Mes cercles
            </ButtonLink>
          }
        />
      </ScreenBody>
    </>
  );
}
