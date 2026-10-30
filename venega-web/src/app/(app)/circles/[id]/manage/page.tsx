import { ManageView } from '@/features/circles/components/manage/ManageView';

export default function ManagePage({ params }: { params: { id: string } }) {
  return <ManageView circleId={params.id} />;
}
