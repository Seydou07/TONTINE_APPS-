'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useDemoStore } from '@/lib/demoStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody } from '@/components/ui/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { getCircle, getCircleMembers, getCurrentUser } from '../../store';
import { RoleBadge } from '../RoleBadge';
import { NotFoundScreen } from './NotFound';
import { formatMonthYear, rolePriority, solidarityRoleLabel } from './labels';

/** Liste des membres d'une caisse de solidarité (copie de SolidarityMembersScreen mobile). */
export function SolidarityMembersView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const circle = getCircle(circleId);
  if (!circle) return <NotFoundScreen header="Membres" />;

  const me = getCurrentUser();
  const members = [...getCircleMembers(circle.id)].sort((a, b) => rolePriority[a.role] - rolePriority[b.role]);

  return (
    <>
      <PageHeader title="Membres" subtitle={`${members.length} membres · ${circle.name}`} onBack={() => router.back()} />
      <ScreenBody>
        <div className="overflow-hidden rounded-[20px] border border-line bg-white">
          {members.map((m, idx) => {
            const fullName = `${m.user.firstName} ${m.user.lastName}`;
            return (
              <Link
                key={m.userId}
                href={`/circles/${circle.id}/solidarity-member/${m.userId}`}
                className="flex items-center gap-3 pl-4 hover:bg-fill"
              >
                <Avatar name={fullName} uri={m.user.avatarUrl} size={40} />
                <span
                  className={`flex min-w-0 flex-1 items-center gap-3 py-3 pr-4 ${
                    idx < members.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">
                      {fullName}
                      {m.userId === me.id ? ' (Moi)' : ''}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-2">
                      <RoleBadge role={m.role} label={solidarityRoleLabel[m.role]} />
                      <span className="text-[13px] text-muted">Membre depuis {formatMonthYear(m.joinedAt)}</span>
                    </span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-subtle" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </ScreenBody>
    </>
  );
}
