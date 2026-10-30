'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Clock, Copy, Inbox, Share2, UserPlus } from 'lucide-react';
import { MembershipRequestStatus } from '@venega/types';
import { useDemoStore } from '@/lib/demoStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody } from '@/components/ui/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/misc';
import { getCircle, getMembershipRequests } from '../../store';
import { NotFoundScreen } from './NotFound';

const formatRelative = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "à l'instant";
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
};

/** Inviter un membre (copie de SolidarityInviteScreen mobile) : code d'invitation + demandes en attente. */
export function InviteView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const circle = getCircle(circleId);
  if (!circle) return <NotFoundScreen header="Inviter un membre" />;

  const pending = getMembershipRequests(circle.id).filter((r) => r.status === MembershipRequestStatus.PENDING);
  const message = `Rejoins la caisse de solidarité "${circle.name}" sur Venega ! Code d'invitation : ${circle.inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(circle.inviteCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (typeof navigator.share === 'function') {
      navigator.share({ text: message }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(message).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <PageHeader title="Inviter un membre" subtitle={circle.name} onBack={() => router.back()} />
      <ScreenBody>
        <div className="flex flex-col items-center px-2 pt-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint text-primary">
            <UserPlus size={24} strokeWidth={1.8} aria-hidden />
          </span>
          <h2 className="mt-3 text-[17px] font-bold text-ink">Tout membre peut inviter</h2>
          <p className="mt-1 max-w-sm text-[14px] text-muted">
            Partagez ce code avec la personne. Sa demande arrivera au fondateur pour validation avant qu&apos;elle ne
            rejoigne le cercle.
          </p>
        </div>

        <div className="rounded-[20px] border border-line bg-white p-5 text-center">
          <p className="text-[13px] text-muted">Code d&apos;invitation</p>
          <p className="mt-1 select-all break-all font-mono text-[26px] font-bold tracking-widest text-ink">
            {circle.inviteCode}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Button variant="secondary" size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
              {copied ? 'Copié' : 'Copier'}
            </Button>
            <Button size="sm" icon={Share2} onClick={handleShare}>
              Partager
            </Button>
          </div>
        </div>

        <section>
          <h2 className="mb-2.5 px-1 text-[17px] font-bold text-ink">En attente d&apos;approbation</h2>
          {pending.length === 0 ? (
            <EmptyState icon={Inbox} title="Aucune demande" text="Aucune demande en attente pour le moment." />
          ) : (
            <div className="overflow-hidden rounded-[20px] border border-line bg-white">
              {pending.map((r, idx) => (
                <div key={r.id} className="flex items-center gap-3 pl-4">
                  <Avatar name={r.fullName} size={40} />
                  <div
                    className={`flex min-w-0 flex-1 items-center gap-3 py-3 pr-4 ${
                      idx < pending.length - 1 ? 'border-b border-line' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-ink">{r.fullName}</p>
                      <p className="text-[13px] text-muted">Demande envoyée {formatRelative(r.createdAt)}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-tint px-2 py-0.5 text-[12px] font-semibold text-amber-dark">
                      <Clock size={13} aria-hidden />
                      En attente
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </ScreenBody>
    </>
  );
}
