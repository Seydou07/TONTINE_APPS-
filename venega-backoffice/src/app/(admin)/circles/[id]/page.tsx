import type { Metadata } from 'next';
import { CircleDetailView } from '@/features/circles/components/CircleDetailView';

export const metadata: Metadata = { title: 'Cercle' };

export default function CircleDetailPage({ params }: { params: { id: string } }) {
  return <CircleDetailView id={params.id} />;
}
