'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, Camera, ChevronDown, Gauge, HelpCircle, History, LogOut, ShieldCheck, Smartphone, UserRound } from 'lucide-react';
import { KycStatus } from '@venega/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { HeroBand } from '@/components/ui/HeroBand';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import { useDemoStore } from '@/lib/demoStore';
import { clearLocalData } from '@/lib/persistence';
import { logout as endSession } from '@/features/auth/api';
import { formatPhone } from '@/features/auth/validation';
import { getCircles, getCurrentUser } from '@/features/circles/store';
import { getProfile } from '../store';

/** Hauteur dont la carte des chiffres clés chevauche le bandeau vert. */
const STATS_OVERLAP = 36;

const FAQ_ITEMS = [
  {
    question: 'Comment fonctionnent les tours de tontine ?',
    answer:
      'À chaque tour, tous les membres versent leur cotisation. La somme collectée est attribuée au bénéficiaire désigné pour ce tour.',
  },
  {
    question: 'Que se passe-t-il si un membre prend du retard ?',
    answer:
      'Des pénalités peuvent s’appliquer selon les règles du cercle. Le score de fiabilité du membre diminue et il peut être relancé ou remplacé.',
  },
  {
    question: 'Comment payer mes cotisations ?',
    answer: 'Les paiements se font par mobile money : Orange Money, Moov Money ou Wave.',
  },
  {
    question: 'Comment vérifier mon identité ?',
    answer: 'Dans « Vérification d’identité », envoyez une photo de votre CNIB puis prenez un selfie de confirmation.',
  },
];

const KYC_LABEL: Record<KycStatus, { text: string; ok: boolean }> = {
  [KycStatus.VERIFIED]: { text: 'Vérifiée', ok: true },
  [KycStatus.PENDING]: { text: 'En cours', ok: false },
  [KycStatus.REJECTED]: { text: 'Refusée', ok: false },
  [KycStatus.NOT_SUBMITTED]: { text: 'À faire', ok: false },
};

/** Onglet Profil (copie de ProfileScreen mobile). */
export function ProfileView() {
  useDemoStore();
  const user = getCurrentUser();
  const profile = getProfile();
  const memberSince = new Date(user.createdAt).getFullYear();
  const circleCount = getCircles().filter((c) => !!c.activatedAt).length;
  const kyc = KYC_LABEL[user.kycStatus] ?? KYC_LABEL[KycStatus.NOT_SUBMITTED];

  // TODO API: le numéro Mobile Money n'est pas encore dans PATCH /users/me (docs/api-mobile.md, section 2).
  const [momoPhone, setMomoPhone] = useState(profile.phone);
  const [draftPhone, setDraftPhone] = useState(momoPhone);
  const [phoneSheet, setPhoneSheet] = useState(false);
  const [helpSheet, setHelpSheet] = useState(false);
  const [logoutSheet, setLogoutSheet] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const draftValid = draftPhone.replace(/\D/g, '').length === 8;

  const savePhone = () => {
    if (!draftValid) return;
    setMomoPhone(draftPhone.trim());
    setPhoneSheet(false);
  };

  const logout = async () => {
    setLogoutSheet(false);
    await endSession();
    clearLocalData();
    // Rechargement complet : les données de démonstration en mémoire repartent de zéro.
    window.location.replace('/login');
  };

  return (
    <>
      {/* ── Identité (section verte) ── */}
      <HeroBand overlap={STATS_OVERLAP} width="narrow">
        <div className="flex flex-col items-center text-center">
          <Link href="/profile/photo" aria-label="Changer la photo de profil" className="relative">
            <Avatar name={profile.name} uri={profile.avatarUrl} size={88} className="ring-2 ring-amber" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary-dark bg-amber text-ink">
              <Camera size={14} aria-hidden />
            </span>
          </Link>
          <p className="mt-3 flex max-w-full items-center gap-1.5">
            <span className="truncate text-[20px] font-bold text-white">{profile.name}</span>
            {kyc.ok && <BadgeCheck size={20} className="shrink-0 text-amber" aria-label="Identité vérifiée" />}
          </p>
          <p className="mt-0.5 text-[14px] text-white/75">+226 {profile.phone}</p>
          <Link
            href="/profile-setup"
            className="mt-3 inline-flex h-9 items-center rounded-full bg-white/10 px-4 text-[14px] font-semibold text-white hover:bg-white/20"
          >
            Modifier le profil
          </Link>
        </div>
      </HeroBand>

      <div className="relative mx-auto max-w-2xl space-y-6 px-4 pb-8 sm:px-6" style={{ marginTop: -STATS_OVERLAP }}>
        {/* ── Chiffres clés ── */}
        <div className="flex items-center rounded-[20px] border border-line bg-white py-3">
          <Stat value={`${circleCount}`} label="Cercles" />
          <span aria-hidden className="h-8 w-px bg-line" />
          <Stat value={`${user.reputationScore}`} label="Fiabilité" href="/reliability" />
          <span aria-hidden className="h-8 w-px bg-line" />
          <Stat value={`${memberSince}`} label="Membre depuis" />
        </div>

        {/* ── Vérification à compléter ── */}
        {!kyc.ok && (
          <Link
            href="/kyc/intro"
            className="flex items-center gap-3 rounded-[20px] border border-amber/40 bg-amber-tint p-3.5 hover:bg-[#FDEBC6]"
          >
            <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-amber-dark">
              <ShieldCheck size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-ink">Vérifiez votre identité</span>
              <span className="block text-[13px] text-ink-soft">Obligatoire pour créer ou rejoindre un cercle.</span>
            </span>
            <span className="text-[14px] font-semibold text-amber-dark">Commencer</span>
          </Link>
        )}

        <ListGroup title="Compte">
          <ListRow icon={UserRound} title="Informations personnelles" href="/profile-setup" />
          <ListRow
            icon={ShieldCheck}
            title="Vérification d’identité"
            value={kyc.text}
            valueTone={kyc.ok ? 'success' : 'muted'}
            href="/kyc/upload"
            last
          />
        </ListGroup>

        <ListGroup title="Paiements">
          <ListRow
            icon={Smartphone}
            title="Numéro mobile money"
            subtitle="Pour recevoir vos cagnottes"
            value={momoPhone}
            onClick={() => {
              setDraftPhone(momoPhone);
              setPhoneSheet(true);
            }}
          />
          <ListRow icon={History} title="Historique des transactions" href="/activity" />
          <ListRow icon={Gauge} title="Score de fiabilité" href="/reliability" last />
        </ListGroup>

        <ListGroup title="Aide">
          <ListRow icon={HelpCircle} title="Centre d’aide" onClick={() => setHelpSheet(true)} last />
        </ListGroup>

        <ListGroup>
          <ListRow icon={LogOut} tone="danger" title="Se déconnecter" chevron={false} onClick={() => setLogoutSheet(true)} last />
        </ListGroup>
      </div>

      {/* ── Numéro mobile money ── */}
      <Sheet open={phoneSheet} onClose={() => setPhoneSheet(false)} title="Numéro mobile money">
        <p className="mb-3 text-[15px] text-muted">Les cagnottes et remboursements seront versés sur ce numéro.</p>
        <TextField
          aria-label="Numéro mobile money"
          prefix="+226"
          placeholder="70 12 34 56"
          type="tel"
          inputMode="tel"
          maxLength={11}
          value={draftPhone}
          onChange={(e) => setDraftPhone(formatPhone(e.target.value))}
          autoFocus
        />
        <Button onClick={savePhone} disabled={!draftValid} className="mt-5">
          Enregistrer
        </Button>
      </Sheet>

      {/* ── Centre d'aide ── */}
      <Sheet open={helpSheet} onClose={() => setHelpSheet(false)} title="Centre d’aide">
        <div>
          {FAQ_ITEMS.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.question} className={i < FAQ_ITEMS.length - 1 ? 'border-b border-line' : ''}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
                >
                  <span className="text-[15px] font-semibold text-ink">{item.question}</span>
                  <ChevronDown size={18} className={`shrink-0 text-subtle ${open ? 'rotate-180' : ''}`} aria-hidden />
                </button>
                {open && <p className="pb-3.5 text-[14px] text-muted">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </Sheet>

      {/* ── Déconnexion ── */}
      <Sheet open={logoutSheet} onClose={() => setLogoutSheet(false)} title="Se déconnecter ?">
        <p className="mb-5 text-[15px] text-muted">Vous devrez saisir à nouveau votre numéro et votre mot de passe.</p>
        <Button variant="danger" onClick={logout}>
          Se déconnecter
        </Button>
        <button
          type="button"
          onClick={() => setLogoutSheet(false)}
          className="mt-2 h-12 w-full rounded-[14px] text-[15px] font-semibold text-ink-soft hover:bg-fill"
        >
          Annuler
        </button>
      </Sheet>
    </>
  );
}

function Stat({ value, label, href }: { value: string; label: string; href?: string }) {
  const content = (
    <>
      <span className="block text-[17px] font-bold text-ink">{value}</span>
      <span className="block text-[12px] text-muted">{label}</span>
    </>
  );
  return href ? (
    <Link href={href} className="flex-1 rounded-[12px] py-1 text-center hover:bg-fill">
      {content}
    </Link>
  ) : (
    <div className="flex-1 py-1 text-center">{content}</div>
  );
}
