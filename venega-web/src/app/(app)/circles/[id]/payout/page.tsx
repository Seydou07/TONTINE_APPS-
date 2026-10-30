import { PayoutView } from '@/features/circles/components/PayoutView';

export default function PayoutPage({ params }: { params: { id: string } }) {
  return <PayoutView circleId={params.id} />;
}
