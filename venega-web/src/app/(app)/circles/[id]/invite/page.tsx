import { InviteView } from '@/features/circles/components/solidarity/InviteView';

export default function InvitePage({ params }: { params: { id: string } }) {
  return <InviteView circleId={params.id} />;
}
