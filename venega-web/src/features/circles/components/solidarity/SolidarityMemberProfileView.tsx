'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Receipt, ShieldCheck, ShieldOff, UserMinus } from 'lucide-react';
import { Role } from '@venega/types';
import { useDemoStore } from '@/lib/demoStore';
import { formatDate, formatF } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody } from '@/components/ui/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { EmptyState } from '@/components/ui/misc';
import {
  getCircle,
  getCircleMembers,
  getCurrentUser,
  getFounderCircleIds,
  getLateCount,
  getLedgerEntries,
  getSolidarityValidators,
  removeMember,
  toggleSolidarityValidator,
} from '../../store';
import { RoleBadge } from '../RoleBadge';
import { NotFoundScreen } from './NotFound';

const roleLabel: Record<Role, string> = {
  [Role.PRESIDENT]: 'Président',
  [Role.TREASURER]: 'Trésorier',
  [Role.SECRETARY]: 'Secrétaire',
  [Role.MEMBER]: 'Membre',
};

type Confirm = 'remove' | 'leave' | null;

/**
 * Fiche d'un membre de la caisse de solidarité (copie de SolidarityMemberProfileScreen mobile) :
 * cotisations, retards ; le fondateur peut nommer / retirer un approbateur ou retirer le membre ;
 * le membre lui-même peut quitter le cercle.
 * TODO API : DELETE /circles/:id/members/:userId (docs/api-mobile.md §3).
 */
export function SolidarityMemberProfileView({ circleId, userId }: { circleId: string; userId: string }) {
  useDemoStore();
  const router = useRouter();
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const circle = getCircle(circleId);
  if (!circle) return <NotFoundScreen header="Profil du membre" />;

  const isFounder = getFounderCircleIds().includes(circle.id);
  const me = getCurrentUser();
  const member = getCircleMembers(circle.id).find((m) => m.userId === userId);

  if (!member) {
    return (
      <NotFoundScreen
        header="Profil du membre"
        title="Membre introuvable"
        text="Ce membre ne fait plus partie du cercle."
      />
    );
  }

  const contributions = getLedgerEntries(circle.id).filter((e) => e.type === 'CREDIT' && e.userId === userId);
  const total = contributions.reduce((s, e) => s + e.amount, 0);
  const lateCount = getLateCount(circle.id, userId);
  const isMemberValidator = getSolidarityValidators(circle.id).includes(userId);
  const fullName = `${member.user.firstName} ${member.user.lastName}`;

  const handleToggleValidator = () => {
    const result = toggleSolidarityValidator(circle.id, member.userId);
    if (!result.success) setBlockedReason(result.reason ?? '');
  };

  const confirmAction = () => {
    removeMember(circle.id, member.userId);
    if (confirm === 'leave') router.push('/circles');
    else router.back();
    setConfirm(null);
  };

  const stats = [
    { value: formatF(total), label: 'Total cotisé', warn: false },
    { value: String(contributions.length), label: 'Cotisation(s)', warn: false },
    { value: String(lateCount), label: 'Retard(s)', warn: lateCount > 0 },
  ];

  return (
    <>
      <PageHeader title="Profil du membre" onBack={() => router.back()} />
      <ScreenBody>
        <div className="flex flex-col items-center gap-2 pt-2 text-center">
          <Avatar name={fullName} uri={member.user.avatarUrl} size={56} />
          <p className="text-[19px] font-bold text-ink">{fullName}</p>
          <RoleBadge role={member.role} label={roleLabel[member.role]} always />
          <p className="text-[13px] text-muted">
            {member.user.phoneNumber} · Membre depuis {formatDate(member.joinedAt)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[20px] border border-line bg-white px-2 py-3.5 text-center">
              <p className={`text-[17px] font-bold ${s.warn ? 'text-amber-dark' : 'text-ink'}`}>{s.value}</p>
              <p className="mt-0.5 text-[12px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-2.5 px-1 text-[17px] font-bold text-ink">Ses cotisations</h2>
          {contributions.length === 0 ? (
            <EmptyState icon={Receipt} title="Aucune cotisation" text="Aucune cotisation enregistrée pour ce membre." />
          ) : (
            <div className="overflow-hidden rounded-[20px] border border-line bg-white px-4">
              {contributions.map((c, idx) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between py-3 ${idx < contributions.length - 1 ? 'border-b border-line' : ''}`}
                >
                  <span className="text-[14px] text-muted">{formatDate(c.createdAt)}</span>
                  <span className="text-[15px] font-semibold text-primary">+{formatF(c.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {member.userId === me.id ? (
          <ListGroup>
            <ListRow icon={LogOut} tone="danger" title="Quitter le cercle" onClick={() => setConfirm('leave')} chevron={false} last />
          </ListGroup>
        ) : (
          isFounder && (
            <div>
              <ListGroup title="Gestion">
                <ListRow
                  icon={isMemberValidator ? ShieldOff : ShieldCheck}
                  tone={isMemberValidator ? 'neutral' : 'primary'}
                  title={isMemberValidator ? "Retirer le droit d'approbateur" : 'Nommer approbateur'}
                  onClick={handleToggleValidator}
                  chevron={false}
                />
                <ListRow icon={UserMinus} tone="danger" title="Retirer du cercle" onClick={() => setConfirm('remove')} chevron={false} last />
              </ListGroup>
              <p className="mt-2 text-center text-[12px] text-subtle">Visible uniquement par le fondateur</p>
            </div>
          )
        )}
      </ScreenBody>

      <Sheet
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === 'leave' ? 'Quitter le cercle ?' : 'Retirer du cercle ?'}
      >
        <p className="text-[15px] text-ink-soft">
          {confirm === 'leave'
            ? `Vous ne ferez plus partie de la caisse de solidarité "${circle.name}".`
            : `${fullName} ne fera plus partie de la caisse de solidarité "${circle.name}".`}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <Button variant="secondary" onClick={() => setConfirm(null)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmAction}>
            {confirm === 'leave' ? 'Quitter' : 'Retirer'}
          </Button>
        </div>
      </Sheet>

      <Sheet open={blockedReason !== null} onClose={() => setBlockedReason(null)} title="Impossible pour le moment">
        <p className="text-[15px] text-ink-soft">{blockedReason}</p>
        <Button variant="secondary" onClick={() => setBlockedReason(null)} className="mt-6">
          Fermer
        </Button>
      </Sheet>
    </>
  );
}
