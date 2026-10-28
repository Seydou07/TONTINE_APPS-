'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, CheckCircle2, ChevronRight, Search, Upload } from 'lucide-react';
import { mockCircles, mockCycles } from '@venega/types';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { btnPrimary, btnSecondary, card, input, label } from '@/components/ui/classes';
import { IconTile, SummaryRow } from '@/components/ui/misc';
import { MobileMoneyCheckout } from '@/features/payment/components/MobileMoneyCheckout';
import { formatFcfa } from '@/lib/format';
import { circleTypeIcon, circleTypeLabel, circleTypeTone, frequencyLabel } from '../labels';

const searchResults = mockCircles.filter((c) => c.id !== 'c1');

type Step = 'search' | 'conditions' | 'form' | 'pay' | 'done';

export function JoinCircleView() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('search');
  const [inviteCode, setInviteCode] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    depositNumber: '',
    cnibFront: null as File | null,
    cnibBack: null as File | null,
  });

  const selectedCircle = mockCircles.find((c) => c.id === selectedCircleId);
  const activeCycle = selectedCircle ? mockCycles.find((c) => c.circleId === selectedCircle.id && c.isActive) : null;
  const currentTurn = activeCycle?.currentTurn ?? 1;
  const pastTurns = currentTurn - 1;
  const rachatAmount = selectedCircle ? pastTurns * selectedCircle.tontineAmount : 0;
  const depositAmount = selectedCircle?.depositRequired ? selectedCircle.tontineAmount : 0;
  const totalPayment = rachatAmount + depositAmount;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inviteCode.trim();
    const found = mockCircles.find(
      (c) =>
        c.id !== 'c1' &&
        (c.inviteCode.toUpperCase() === q.toUpperCase() || c.name.toLowerCase().includes(q.toLowerCase())),
    );
    if (found) {
      setNotFound(false);
      setSelectedCircleId(found.id);
      setStep('conditions');
    } else {
      setNotFound(true);
    }
  };

  const back = () => {
    if (step === 'conditions') setStep('search');
    else if (step === 'form') setStep('conditions');
    else if (step === 'pay') setStep('form');
    else router.push('/circles');
  };

  const subtitle =
    step === 'search' ? "Code d'invitation ou recherche" : step === 'done' ? 'Demande envoyée' : selectedCircle?.name;

  return (
    <>
      <PageHeader title="Rejoindre un cercle" subtitle={subtitle} onBack={back} />

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-5 sm:px-6">
        {/* ── Recherche ── */}
        {step === 'search' && (
          <>
            <form onSubmit={handleSearch} className={`${card} p-5`}>
              <label htmlFor="invite-code" className={label}>
                Code d&apos;invitation
              </label>
              <p className="-mt-0.5 mb-3 text-[13px] text-muted">Demandez-le au président du cercle.</p>
              <div className="flex gap-2.5">
                <input
                  id="invite-code"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    setNotFound(false);
                  }}
                  placeholder="Ex. ROOD25K"
                  autoComplete="off"
                  className={`${input} font-semibold uppercase tracking-wider`}
                />
                <button
                  type="submit"
                  disabled={!inviteCode.trim()}
                  aria-label="Rechercher"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-primary text-white disabled:opacity-50"
                >
                  <Search size={20} aria-hidden />
                </button>
              </div>
              {notFound && (
                <p role="alert" className="mt-2 text-[13px] text-danger">
                  Aucun cercle ne correspond à ce code. Vérifiez-le auprès du président.
                </p>
              )}
            </form>

            <section>
              <h2 className="mb-3 text-[17px] font-bold text-ink">Cercles disponibles</h2>
              <ul className="space-y-2.5">
                {searchResults.map((circle) => {
                  const cycle = mockCycles.find((c) => c.circleId === circle.id && c.isActive);
                  return (
                    <li key={circle.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCircleId(circle.id);
                          setConditionsAccepted(false);
                          setStep('conditions');
                        }}
                        className={`${card} flex w-full items-center gap-3 p-4 text-left transition-colors hover:border-line-strong`}
                      >
                        <IconTile icon={circleTypeIcon(circle.type)} tone={circleTypeTone(circle.type)} size={42} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold text-ink">{circle.name}</p>
                          <p className="text-[13px] text-muted">
                            {circleTypeLabel(circle.type)} · {circle.memberCount} membres
                            {cycle ? ` · Tour ${cycle.currentTurn}/${cycle.totalTurns}` : ''}
                          </p>
                        </div>
                        <span className="shrink-0 text-right text-[14px] font-bold text-primary-dark">
                          {formatFcfa(circle.tontineAmount || circle.solidarityAmount)}
                        </span>
                        <ChevronRight size={18} className="shrink-0 text-subtle" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        {/* ── Conditions ── */}
        {step === 'conditions' && selectedCircle && (
          <>
            <section className={`${card} p-5`}>
              <div className="flex items-start gap-3">
                <IconTile
                  icon={circleTypeIcon(selectedCircle.type)}
                  tone={circleTypeTone(selectedCircle.type)}
                  size={44}
                />
                <div className="min-w-0">
                  <h2 className="text-[17px] font-bold text-ink">{selectedCircle.name}</h2>
                  <Badge tone={circleTypeTone(selectedCircle.type)} className="mt-1">
                    {circleTypeLabel(selectedCircle.type)}
                  </Badge>
                </div>
              </div>

              <h3 className="mt-5 text-[14px] font-semibold text-ink">Conditions du cercle</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{selectedCircle.conditions}</p>

              <dl className="mt-4 divide-y divide-line border-t border-line">
                {selectedCircle.tontineAmount > 0 && (
                  <SummaryRow label="Cotisation tontine">{formatFcfa(selectedCircle.tontineAmount)}</SummaryRow>
                )}
                {selectedCircle.solidarityAmount > 0 && (
                  <SummaryRow label="Cotisation solidarité">{formatFcfa(selectedCircle.solidarityAmount)}</SummaryRow>
                )}
                <SummaryRow label="Fréquence">{frequencyLabel(selectedCircle.frequency)}</SummaryRow>
                <SummaryRow label="Membres">{selectedCircle.memberCount}</SummaryRow>
                {selectedCircle.managementFee > 0 && (
                  <SummaryRow label="Frais de gestion">{formatFcfa(selectedCircle.managementFee)} / tour</SummaryRow>
                )}
                {selectedCircle.depositRequired && (
                  <SummaryRow label="Dépôt de garantie">{formatFcfa(selectedCircle.tontineAmount)}</SummaryRow>
                )}
                <SummaryRow label="Exclusion après">{selectedCircle.exclusionThreshold} retards</SummaryRow>
                {selectedCircle.recalculateOnLeave && <SummaryRow label="Recalcul si départ">Oui</SummaryRow>}
                {selectedCircle.nextPaymentRequired && (
                  <SummaryRow label="Payer avant de recevoir">Obligatoire</SummaryRow>
                )}
              </dl>
            </section>

            {pastTurns > 0 || depositAmount > 0 ? (
              <section className="rounded-[20px] bg-amber-tint p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-dark" aria-hidden />
                  <div className="text-[14px] text-ink-soft">
                    <p className="font-semibold text-ink">Montant à l&apos;entrée</p>
                    {pastTurns > 0 && (
                      <p className="mt-1">
                        Vous rejoignez le cercle au tour {currentTurn}. Les {pastTurns} tour{pastTurns > 1 ? 's' : ''}{' '}
                        passé{pastTurns > 1 ? 's' : ''} sont à racheter : {formatFcfa(selectedCircle.tontineAmount)} ×{' '}
                        {pastTurns} = <strong className="text-ink">{formatFcfa(rachatAmount)}</strong>.
                      </p>
                    )}
                    {depositAmount > 0 && (
                      <p className="mt-1">
                        Dépôt de garantie : <strong className="text-ink">{formatFcfa(depositAmount)}</strong>.
                      </p>
                    )}
                    <p className="mt-2 text-[15px] font-bold text-ink">Total : {formatFcfa(totalPayment)}</p>
                  </div>
                </div>
              </section>
            ) : null}

            <label className={`${card} flex cursor-pointer items-start gap-3 p-4`}>
              <input
                type="checkbox"
                checked={conditionsAccepted}
                onChange={(e) => setConditionsAccepted(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
              />
              <span className="text-[14px] text-ink">
                J&apos;ai lu et j&apos;accepte les conditions du cercle
                {rachatAmount > 0 ? (
                  <>
                    , y compris les frais de rachat de <strong>{formatFcfa(rachatAmount)}</strong>
                  </>
                ) : null}
                .
              </span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setStep('search')} className={btnSecondary}>
                Retour
              </button>
              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={!conditionsAccepted}
                className={btnPrimary}
              >
                Continuer
              </button>
            </div>
          </>
        )}

        {/* ── Informations ── */}
        {step === 'form' && selectedCircle && (
          <>
            <section className={`${card} space-y-4 p-5`}>
              <h2 className="text-[17px] font-bold text-ink">Vos informations</h2>

              <div>
                <label htmlFor="j-name" className={label}>
                  Nom complet
                </label>
                <input
                  id="j-name"
                  autoComplete="name"
                  placeholder="Ex. Aminata Ouédraogo"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="j-phone" className={label}>
                  Numéro de téléphone
                </label>
                <input
                  id="j-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+226 70 12 34 56"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="j-deposit" className={label}>
                  Numéro Mobile Money pour recevoir la cagnotte
                </label>
                <input
                  id="j-deposit"
                  type="tel"
                  inputMode="tel"
                  placeholder="+226 70 12 34 56"
                  value={form.depositNumber}
                  onChange={(e) => setForm((p) => ({ ...p, depositNumber: e.target.value }))}
                  className={input}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <FilePick
                  label="CNIB recto"
                  file={form.cnibFront}
                  onChange={(f) => setForm((p) => ({ ...p, cnibFront: f }))}
                />
                <FilePick
                  label="CNIB verso"
                  file={form.cnibBack}
                  onChange={(f) => setForm((p) => ({ ...p, cnibBack: f }))}
                />
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setStep('conditions')} className={btnSecondary}>
                Retour
              </button>
              <button
                type="button"
                onClick={() => setStep(totalPayment > 0 ? 'pay' : 'done')}
                disabled={!form.fullName || !form.phoneNumber || !form.depositNumber}
                className={btnPrimary}
              >
                {totalPayment > 0 ? 'Continuer' : 'Envoyer la demande'}
              </button>
            </div>
          </>
        )}

        {/* ── Paiement de la place (parcours de paiement unique) ── */}
        {step === 'pay' && selectedCircle && (
          <MobileMoneyCheckout
            title="Payer ma place"
            amount={totalPayment}
            phone={form.phoneNumber || '+226'}
            details={[
              { label: 'Cercle', value: selectedCircle.name },
              ...(rachatAmount > 0
                ? [{ label: `Rachat (${pastTurns} tour${pastTurns > 1 ? 's' : ''})`, value: formatFcfa(rachatAmount) }]
                : []),
              ...(depositAmount > 0 ? [{ label: 'Dépôt de garantie', value: formatFcfa(depositAmount) }] : []),
            ]}
            successText="Paiement reçu. Votre demande est transmise au président du cercle."
            done={{ onClick: () => setStep('done'), label: 'Continuer' }}
          />
        )}

        {/* ── Terminé ── */}
        {step === 'done' && (
          <section className={`${card} p-6 text-center`}>
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint text-primary">
              <CheckCircle2 size={30} aria-hidden />
            </span>
            <h2 className="text-[20px] font-bold text-ink">Demande envoyée</h2>
            <p className="mx-auto mt-1 max-w-sm text-[15px] text-muted">
              Votre demande pour rejoindre <strong className="text-ink">{selectedCircle?.name}</strong> attend la
              validation du président. Vous recevrez une notification dès sa décision.
            </p>
            <Link href="/circles" className={`${btnPrimary} mt-5`}>
              Retour à mes cercles
            </Link>
          </section>
        )}
      </div>
    </>
  );
}

function FilePick({ label: text, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed p-4 text-center transition-colors ${
        file ? 'border-primary bg-[#F0F7F4]' : 'border-line-strong bg-white hover:bg-fill'
      }`}
    >
      {file ? (
        <Check size={20} className="text-primary" aria-hidden />
      ) : (
        <Upload size={20} className="text-muted" aria-hidden />
      )}
      <span className="text-[14px] font-semibold text-ink">{text}</span>
      <span className="max-w-full truncate text-[12px] text-muted">{file ? file.name : 'Choisir une photo'}</span>
      <input type="file" accept="image/*" className="sr-only" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </label>
  );
}
