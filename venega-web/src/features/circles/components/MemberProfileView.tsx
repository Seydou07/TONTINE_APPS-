'use client';

import { FileX, SearchX, ShieldCheck } from 'lucide-react';
import { Role } from '@venega/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody } from '@/components/ui/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { useDemoStore } from '@/lib/demoStore';
import {
  getCircle,
  getCircleMembers,
  getFounderCircleIds,
  getMemberDocuments,
  getMembershipRequests,
} from '../store';
import { MemberDocuments } from './MemberDocuments';
import { RoleBadge } from './RoleBadge';

/*
 * Profil d'un membre de tontine — copie de MemberProfileScreen.tsx mobile.
 * Les documents (CNIB, selfie) ne sont visibles que par le fondateur.
 * TODO API : `GET /circles/:id/members/:userId/documents` (docs/api-mobile.md, section 3).
 */

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const sectionTitle = 'mb-2 px-1 text-[13px] font-semibold text-muted';

export function MemberProfileView({ circleId, userId }: { circleId: string; userId: string }) {
  useDemoStore();
  const circle = getCircle(circleId);
  const backHref = `/circles/${circleId}/tontine`;

  const member = circle ? getCircleMembers(circle.id).find((m) => m.userId === userId) : undefined;
  // Repli : membre validé mais pas encore dans la liste des membres → infos de sa demande.
  const request =
    circle && !member ? getMembershipRequests(circle.id).find((r) => r.userId === userId) : undefined;

  if (!circle || (!member && !request)) {
    return (
      <>
        <PageHeader title="Profil du membre" backHref={backHref} />
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fill text-muted">
            <SearchX size={24} aria-hidden />
          </span>
          <p className="mt-3 text-[15px] font-semibold text-ink">Membre introuvable</p>
          <p className="mt-1 text-[14px] text-muted">Ce membre ne fait plus partie du cercle.</p>
        </div>
      </>
    );
  }

  const isFounder = getFounderCircleIds().includes(circle.id);
  const docs = getMemberDocuments(circle.id, userId);
  const fullName = member ? `${member.user.firstName} ${member.user.lastName}` : request!.fullName;
  const phone = member?.user.phoneNumber ?? request!.phoneNumber;
  const avatarUrl = member?.user.avatarUrl ?? request?.user?.avatarUrl;

  // Tontine : seulement Fondateur ou Membre (pas de trésorier / secrétaire).
  const isMemberFounder = member?.role === Role.PRESIDENT;
  const role = isMemberFounder ? Role.PRESIDENT : Role.MEMBER;
  const roleLabel = isMemberFounder ? 'Fondateur' : 'Membre';

  const infoRows: { label: string; value: string }[] = [];
  if (member?.turnOrder !== undefined) infoRows.push({ label: 'Tour de passage', value: `Tour ${member.turnOrder}` });
  infoRows.push({
    label: 'Membre depuis',
    value: formatDate(member?.joinedAt ?? request?.decidedAt ?? request?.createdAt),
  });
  if (docs?.depositNumber) infoRows.push({ label: 'Numéro Mobile Money', value: docs.depositNumber });
  if (member && typeof member.reliabilityScore === 'number') {
    infoRows.push({ label: 'Score de fiabilité', value: `${member.reliabilityScore} / 100` });
  }

  return (
    <>
      <PageHeader title="Profil du membre" subtitle={circle.name} backHref={backHref} />
      <ScreenBody>
        <div className="flex flex-col items-center gap-2 pt-2 text-center">
          <Avatar name={fullName} uri={avatarUrl} size={56} />
          <p className="text-[20px] font-bold text-ink">{fullName}</p>
          <RoleBadge role={role} label={roleLabel} always />
          <p className="text-[14px] text-muted">{phone}</p>
        </div>

        <section>
          <h2 className={sectionTitle}>Informations</h2>
          <dl className="rounded-[20px] border border-line bg-white px-4">
            {infoRows.map((r, idx) => (
              <div
                key={r.label}
                className={`flex items-center justify-between gap-4 py-3.5 ${idx < infoRows.length - 1 ? 'border-b border-line' : ''}`}
              >
                <dt className="text-[15px] text-muted">{r.label}</dt>
                <dd className="text-right text-[15px] font-medium text-ink">{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className={sectionTitle}>Documents</h2>
          {!docs ? (
            <div className="flex flex-col items-center rounded-[20px] border border-line bg-white px-4 py-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-fill text-muted">
                <FileX size={22} aria-hidden />
              </span>
              <p className="mt-2 text-[15px] font-semibold text-ink">Aucun document fourni</p>
            </div>
          ) : isFounder ? (
            <>
              <MemberDocuments
                title={null}
                fullName={fullName}
                phoneNumber={phone}
                avatarUrl={avatarUrl}
                cnibFrontUrl={docs.cnibFrontUrl}
                cnibBackUrl={docs.cnibBackUrl}
                selfieUrl={docs.selfieUrl}
              />
              <p className="mt-2 px-1 text-[13px] text-muted">
                Fournis le {formatDate(docs.submittedAt)} · Visible uniquement par le fondateur
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2.5 rounded-[20px] border border-line bg-white p-4">
              <ShieldCheck size={20} className="text-primary" aria-hidden />
              <p className="text-[15px] text-ink">Documents vérifiés par le fondateur</p>
            </div>
          )}
        </section>
      </ScreenBody>
    </>
  );
}
