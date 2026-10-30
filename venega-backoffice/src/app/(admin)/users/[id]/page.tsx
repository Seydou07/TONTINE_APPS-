import { Suspense } from 'react';
import type { Metadata } from 'next';
import { UserProfileView } from '@/features/users/components/UserProfileView';

export const metadata: Metadata = { title: 'Fiche utilisateur' };

export default function UserPage({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <UserProfileView id={params.id} />
    </Suspense>
  );
}
