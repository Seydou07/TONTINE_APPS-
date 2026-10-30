'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, Info, Upload, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { label as labelClass } from '@/components/ui/classes';
import { CenteredState, KeyValue, Notice, ScreenBody, ScreenFooter, SectionTitle } from '@/components/ui/blocks';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { getActiveCycle, getCircle, getCircleMembers, getCurrentUser } from '../../store';

/** Remplacement d'un membre sortant (copie de ReplacementScreen mobile). */
export function ReplacementView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const [step, setStep] = useState<'select' | 'form' | 'done'>('select');
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', depositNumber: '' });
  const back = () => router.back();

  const circle = getCircle(circleId);
  if (!circle) {
    return (
      <>
        <PageHeader title="Remplacer un membre" onBack={back} />
        <ScreenBody>
          <CenteredState icon={Info} tone="neutral" title="Cercle introuvable" />
        </ScreenBody>
      </>
    );
  }

  const me = getCurrentUser();
  const cycle = getActiveCycle(circle);
  const members = getCircleMembers(circle.id);
  const pastTurns = cycle ? cycle.currentTurn - 1 : 0;
  const rachatAmount = pastTurns * circle.tontineAmount;
  const lastTurnOrder = members.length;
  const depositAmount = circle.depositRequired ? circle.tontineAmount : 0;
  const formIncomplete = !form.fullName || !form.phoneNumber || !form.depositNumber;
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <>
      <PageHeader
        title="Remplacer un membre"
        subtitle={circle.name}
        onBack={() => (step === 'form' ? setStep('select') : back())}
      />
      <ScreenBody>
        {step === 'select' && (
          <>
            <Notice icon={Info} tone="info" title="Règle de remplacement">
              Le remplaçant paie les cotisations des tours passés (rachat) et est placé en dernier dans l&apos;ordre de
              rotation.
            </Notice>
            <section className="space-y-2.5">
              <SectionTitle>Membre sortant</SectionTitle>
              <div role="radiogroup" aria-label="Membre sortant" className="overflow-hidden rounded-[20px] border border-line bg-white">
                {members
                  .filter((m) => m.userId !== me.id)
                  .map((m, idx, arr) => {
                    const isSelected = selected === m.userId;
                    const name = `${m.user.firstName} ${m.user.lastName}`;
                    return (
                      <button
                        key={m.userId}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelected(m.userId)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-fill ${
                          idx < arr.length - 1 ? 'border-b border-line' : ''
                        }`}
                      >
                        <Avatar name={name} uri={m.user.avatarUrl} size={40} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold text-ink">{name}</span>
                          <span className="block text-[13px] text-muted">
                            Position {m.turnOrder} · Fiabilité {m.reliabilityScore}/100
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
                            isSelected ? 'border-primary' : 'border-line-strong'
                          }`}
                        >
                          {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </section>
            <ScreenFooter>
              <Button icon={UserPlus} onClick={() => setStep('form')} disabled={!selected}>
                Inviter un remplaçant
              </Button>
            </ScreenFooter>
          </>
        )}

        {step === 'form' && (
          <>
            <div className="rounded-[20px] bg-primary-dark p-5 text-center text-white">
              <p className="text-[13px] text-white/75">Frais de rachat</p>
              <p className="mt-1 text-[28px] font-bold">{formatFcfa(rachatAmount)}</p>
              <p className="mt-1 text-[13px] text-amber">
                {pastTurns} tours × {formatFcfa(circle.tontineAmount)}
              </p>
            </div>
            <div className="rounded-[20px] border border-line bg-white px-4">
              <KeyValue
                label="Dépôt de garantie"
                value={circle.depositRequired ? formatFcfa(circle.tontineAmount) : 'Non requis'}
              />
              <KeyValue
                label="Total à payer"
                value={formatFcfa(rachatAmount + depositAmount)}
                valueClassName="!text-primary"
                strong
                last
              />
            </div>

            <section className="space-y-4">
              <SectionTitle>Informations du remplaçant</SectionTitle>
              <TextField label="Nom complet" placeholder="Ex. Moussa Kaboré" value={form.fullName} onChange={set('fullName')} />
              <TextField
                label="Numéro de téléphone"
                prefix="+226"
                placeholder="70 12 34 56"
                type="tel"
                inputMode="tel"
                value={form.phoneNumber}
                onChange={set('phoneNumber')}
              />
              <TextField
                label="Numéro Mobile Money de dépôt"
                prefix="+226"
                placeholder="70 12 34 56"
                type="tel"
                inputMode="tel"
                value={form.depositNumber}
                onChange={set('depositNumber')}
              />
              <div>
                <p className={labelClass}>Pièce d&apos;identité (CNIB)</p>
                {/* Envoi simulé, comme sur le mobile. TODO API: POST /uploads (docs/api-mobile.md, section 6). */}
                <div className="grid grid-cols-2 gap-2.5">
                  {['Recto', 'Verso'].map((side) => (
                    <button
                      key={side}
                      type="button"
                      className="flex h-[72px] flex-col items-center justify-center gap-1 rounded-[14px] border border-dashed border-line-strong bg-white text-[13px] font-medium text-muted hover:bg-fill"
                    >
                      <Upload size={18} aria-hidden />
                      {side}
                    </button>
                  ))}
                </div>
              </div>
              <Notice icon={AlertTriangle} tone="warning">
                Le remplaçant sera placé en dernier dans l&apos;ordre de rotation (position {lastTurnOrder + 1}). Il devra
                patienter jusqu&apos;à son tour pour recevoir la cagnotte.
              </Notice>
            </section>
            <ScreenFooter>
              <div className="grid grid-cols-[1fr_2fr] gap-2.5">
                <Button variant="secondary" onClick={() => setStep('select')}>
                  Retour
                </Button>
                {/* TODO API: invitation d'un remplaçant non décrite dans docs/api-mobile.md. */}
                <Button onClick={() => setStep('done')} disabled={formIncomplete}>
                  Envoyer l&apos;invitation
                </Button>
              </div>
            </ScreenFooter>
          </>
        )}

        {step === 'done' && (
          <>
            <CenteredState
              icon={Check}
              tone="primary"
              title="Invitation envoyée"
              text={`Le remplaçant devra payer le rachat de ${formatFcfa(rachatAmount)} et sera placé en dernier dans l'ordre de rotation.`}
            />
            <ScreenFooter>
              <Button onClick={back}>Retour au cercle</Button>
            </ScreenFooter>
          </>
        )}
      </ScreenBody>
    </>
  );
}
