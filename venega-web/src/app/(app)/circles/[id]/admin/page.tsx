import { CircleAdminView } from '@/features/circles/components/manage/CircleAdminView';

export default function CircleAdminPage({ params }: { params: { id: string } }) {
  return <CircleAdminView circleId={params.id} />;
}
