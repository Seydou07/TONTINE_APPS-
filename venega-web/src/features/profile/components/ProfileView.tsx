import Link from 'next/link';
import { BadgeCheck, HandHeart, History, KeyRound, LogOut, MessageSquare, Settings, ShieldCheck, UserPen } from 'lucide-react';
import { KycStatus, mockCurrentUser, mockMemberships } from '@venega/types';
import { Badge } from '@/components/ui/Badge';
import { HeroBand, PageBody } from '@/components/ui/HeroBand';
import { card } from '@/components/ui/classes';
import { ListLink } from '@/components/ui/misc';
import { formatPhone, initials } from '@/lib/format';

const OVERLAP = 40;

export function ProfileView() {
  const user = mockCurrentUser;
  const fullName = `${user.firstName} ${user.lastName}`;
  const verified = user.kycStatus === KycStatus.VERIFIED;
  const circlesCount = mockMemberships.filter((m) => m.userId === user.id).length;

  return (
    <>
      <HeroBand overlap={OVERLAP} width="narrow">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-[22px] font-bold text-primary-dark"
          >
            {initials(fullName)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[22px] font-bold text-white">{fullName}</h1>
            <p className="text-[14px] text-white/75">{formatPhone(user.phoneNumber)}</p>
            {verified && (
              <span className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-amber">
                <BadgeCheck size={15} aria-hidden />
                Identité vérifiée
              </span>
            )}
          </div>
        </div>
      </HeroBand>

      <PageBody overlap={OVERLAP} width="narrow">
        <dl className={`${card} grid grid-cols-3 divide-x divide-line`}>
          {[
            { label: 'Score de confiance', value: String(user.reputationScore) },
            { label: 'Cercles', value: String(circlesCount) },
            { label: 'Identité', value: verified ? 'Vérifiée' : 'À vérifier' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col-reverse p-4 text-center">
              <dt className="mt-0.5 text-[12px] text-muted">{s.label}</dt>
              <dd className="text-[20px] font-bold text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>

        <section>
          <h2 className="mb-2 px-1 text-[13px] font-semibold text-muted">Mon compte</h2>
          <nav className={`${card} divide-y divide-line overflow-hidden`}>
            <ListLink href="/profile" icon={UserPen} title="Modifier le profil" />
            <ListLink
              href="/kyc/intro"
              icon={ShieldCheck}
              title="Vérification d'identité"
              subtitle="CNIB et selfie"
              tone="amber"
              right={verified ? <Badge tone="green">Vérifiée</Badge> : <Badge tone="amber">À faire</Badge>}
            />
            <ListLink href="/profile" icon={KeyRound} title="Sécurité et mot de passe" tone="neutral" />
            <ListLink href="/profile" icon={Settings} title="Paramètres" tone="neutral" />
          </nav>
        </section>

        <section>
          <h2 className="mb-2 px-1 text-[13px] font-semibold text-muted">Suivi</h2>
          <nav className={`${card} divide-y divide-line overflow-hidden`}>
            <ListLink href="/reliability" icon={BadgeCheck} title="Score de fiabilité" subtitle="Vos paiements dans chaque cercle" />
            <ListLink href="/activity" icon={History} title="Historique" subtitle="Toutes vos transactions" />
            <ListLink href="/solidarity" icon={HandHeart} title="Caisse de solidarité" tone="amber" />
            <ListLink href="/messages" icon={MessageSquare} title="Messages" tone="neutral" />
          </nav>
        </section>

        <Link
          href="/login"
          className={`${card} flex h-[52px] items-center justify-center gap-2 text-[15px] font-semibold text-danger hover:bg-danger-tint`}
        >
          <LogOut size={18} aria-hidden />
          Se déconnecter
        </Link>
      </PageBody>
    </>
  );
}
