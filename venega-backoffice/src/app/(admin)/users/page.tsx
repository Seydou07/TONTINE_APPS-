import { Suspense } from 'react';
import type { Metadata } from 'next';
import { UsersView } from '@/features/users/components/UsersView';

export const metadata: Metadata = { title: 'Utilisateurs' };

export default function UsersPage() {
  return (
    <Suspense>
      <UsersView />
    </Suspense>
  );
}
