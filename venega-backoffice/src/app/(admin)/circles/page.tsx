import type { Metadata } from 'next';
import { CirclesView } from '@/features/circles/components/CirclesView';

export const metadata: Metadata = { title: 'Cercles' };

export default function CirclesPage() {
  return <CirclesView />;
}
