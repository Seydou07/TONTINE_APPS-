'use client';

import { useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Search, ShieldCheck, Upload, Users } from 'lucide-react';
import {
  AdhesionPaymentStatus,
  KycRequirement,
  KycStatus,
  MembershipRequestStatus,
  type Circle,
  type User,
} from '@venega/types';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { CenteredState, CheckRow, KeyValue, Notice, ScreenBody, ScreenFooter } from '@/components/ui/blocks';
import { TextField } from '@/components/ui/TextField';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { MobileMoneyCheckout } from '@/features/payment/components/MobileMoneyCheckout';
import {
  addMembershipRequest,
  buildConditionsText,
  computeAdhesionTotal,
  computeDeposit,
  computeRachat,
  getActiveCycle,
  getCircleByInvite,
  getCirclePhase,
  getCurrentUser,
} from '../../store';

/*
 * Rejoindre un cercle (écran mobile JoinCircleScreen) : code d'invitation → fiche du
 * cercle et conditions → informations et documents → paiement (rachat + dépôt, si dû)
 * → demande envoyée au fondateur.
 * TODO API : `GET /circles/join/:inviteCode`, `POST /circles/:id/join`, paiement
 * `POST /payments` { purpose: 'ADHESION' } (docs/api-mobile.md, sections 3 et 4).
 */

const typeLabels: Record<string, string> = {
  TONTINE_ONLY: 'Tontine rotative',
  SOLIDARITY_ONLY: 'Caisse de solidarité',
  NATURE: 'Tontine en nature',
};

const cotisationLine = (c: Circle): string => {
  const parts: string[] = [];
  if (c.tontineAmount > 0) parts.push(`${formatFcfa(c.tontineAmount)} de tontine`);
  if (c.solidarityAmount > 0) parts.push(`${formatFcfa(c.solidarityAmount)} de solidarité`);
  return parts.length > 0 ? parts.join(' + ') : '—';
};

type Step = 'search' | 'fiche' | 'form' | 'payment' | 'done';
const ORDER = ['fiche', 'form', 'payment'] as const;

export function JoinCircleView() {
  useDemoStore();
  const router = useRouter();
  const me = getCurrentUser();

  const [step, setStep] = useState<Step>('search');
  const [inviteCode, setInviteCode] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [notActive, setNotActive] = useState(false);
  const [circle, setCircle] = useState<Circle | null>(null);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [form, setForm] = useState({
    fullName: me.displayName,
    phoneNumber: me.phoneNumber,
    depositNumber: me.phoneNumber,
  });
  const [docs, setDocs] = useState({ cnibFront: false, cnibBack: false, selfie: false });
  const [paymentRef, setPaymentRef] = useState('');

  const cycle = circle ? getActiveCycle(circle) : undefined;
  const phase = circle ? getCirclePhase(circle, cycle) : 'CONSTITUTION';
  const rachat = circle ? computeRachat(circle, cycle) : 0;
  const deposit = circle ? computeDeposit(circle, cycle) : 0;
  const total = circle ? computeAdhesionTotal(circle, cycle) : 0;
  const kyc = circle?.rules?.kycRequirement ?? KycRequirement.NONE;

  const accountVerified = me.kycStatus === KycStatus.VERIFIED;
  const needsDocs = !accountVerified && kyc !== KycRequirement.NONE;
  const needsSelfie = !accountVerified && kyc === KycRequirement.CNIB_SELFIE;
  const needsPayment = total > 0;

  const formFilled = form.fullName.trim() && form.phoneNumber.trim() && form.depositNumber.trim();
  const docsOk = (!needsDocs || (docs.cnibFront && docs.cnibBack)) && (!needsSelfie || docs.selfie);

  const handleSearch = () => {
    if (!inviteCode.trim()) return;
    const found = getCircleByInvite(inviteCode);
    setNotActive(false);
    if (found) {
      if (!found.activatedAt) {
        setNotFound(false);
        setNotActive(true);
        return;
      }
      setCircle(found);
      setNotFound(false);
      setConditionsAccepted(false);
      setStep('fiche');
    } else {
      setNotFound(true);
    }
  };

  const reset = () => {
    setCircle(null);
    setInviteCode('');
    setNotFound(false);
    setNotActive(false);
    setStep('search');
    setConditionsAccepted(false);
    setDocs({ cnibFront: false, cnibBack: false, selfie: false });
  };

  const buildRequest = (paymentStatus?: AdhesionPaymentStatus, ref?: string) => {
    if (!circle) return;
    const candidateUser: User = {
      id: me.id,
      phoneNumber: form.phoneNumber.trim(),
      displayName: form.fullName.trim(),
      firstName: form.fullName.trim().split(' ')[0] || '',
      lastName: form.fullName.trim().split(' ').slice(1).join(' ') || '',
      kycStatus: me.kycStatus,
      reputationScore: me.reputationScore,
      createdAt: me.createdAt,
    };
    addMembershipRequest({
      id: 'mr' + Date.now(),
      circleId: circle.id,
      userId: me.id,
      status: MembershipRequestStatus.PENDING,
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      depositNumber: form.depositNumber.trim(),
      cnibFrontUrl: needsDocs ? '/mock/cnib-front-candidat.jpg' : '',
      cnibBackUrl: needsDocs ? '/mock/cnib-back-candidat.jpg' : '',
      selfieUrl: needsSelfie ? '/mock/selfie-candidat.jpg' : undefined,
      conditionsAccepted: true,
      joiningFee: rachat,
      depositAmount: deposit,
      paymentStatus,
      paymentReference: ref,
      paidAt: paymentStatus === AdhesionPaymentStatus.PAID ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      user: candidateUser,
    });
  };

  const submitRequest = () => {
    buildRequest();
    setStep('done');
  };

  // Paiement validé : la demande est enregistrée comme payée.
  const onPaid = () => {
    const ref = `CP-${Date.now().toString().slice(-6)}`;
    setPaymentRef(ref);
    buildRequest(AdhesionPaymentStatus.PAID, ref);
    setStep('done');
  };

  const kycLabel = kyc === KycRequirement.NONE ? 'Aucun document' : kyc === KycRequirement.CNIB ? 'CNIB' : 'CNIB + Selfie';

  const isSegmentActive = (s: (typeof ORDER)[number]) => {
    if (step === 'done') return s === 'fiche' || s === 'form' || (s === 'payment' && needsPayment);
    return ORDER.indexOf(step as never) >= ORDER.indexOf(s);
  };

  const goBack = () => {
    if (step === 'form') return setStep('fiche');
    if (step === 'payment') return setStep('form');
    if (step === 'fiche') return reset();
    router.back();
  };

  const footer = (() => {
    switch (step) {
      case 'search':
        return (
          <Button icon={Search} disabled={!inviteCode.trim()} onClick={handleSearch}>
            Rechercher
          </Button>
        );
      case 'fiche':
        return (
          <Button disabled={!conditionsAccepted} onClick={() => setStep('form')}>
            Continuer
          </Button>
        );
      case 'form':
        return (
          <Button disabled={!formFilled || !docsOk} onClick={() => (needsPayment ? setStep('payment') : submitRequest())}>
            {needsPayment ? 'Continuer vers le paiement' : 'Envoyer la demande'}
          </Button>
        );
      case 'payment':
        return null;
      case 'done':
        return <Button onClick={() => router.push('/circles')}>Retour aux cercles</Button>;
    }
  })();

  return (
    <>
      <PageHeader
        title="Rejoindre un cercle"
        subtitle={circle && step !== 'search' ? circle.name : undefined}
        onBack={goBack}
      />
      {step !== 'search' && (
        <div className="mx-auto flex max-w-2xl gap-1.5 px-4 pt-3 sm:px-6" aria-hidden>
          {ORDER.map((s) => (
            <span key={s} className={`h-1 flex-1 rounded-full ${isSegmentActive(s) ? 'bg-primary' : 'bg-line'}`} />
          ))}
        </div>
      )}

      <ScreenBody>
        {/* ── Recherche par code ── */}
        {step === 'search' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center pt-4 text-center">
              <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint text-primary">
                <Users size={26} strokeWidth={1.8} />
              </span>
              <h1 className="mt-4 text-[22px] font-bold text-ink">Entrez le code d&apos;invitation</h1>
              <p className="mt-1.5 max-w-md text-[15px] text-muted">
                Le code vous est remis par le fondateur du cercle. Votre compte Venega pré-remplit vos informations :
                vous n&apos;avez rien à ressaisir.
              </p>
            </div>
            <TextField
              label="Code d'invitation"
              placeholder="Ex. DASS4821"
              autoCapitalize="characters"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              className="text-center font-mono text-[18px] font-semibold uppercase tracking-[0.12em]"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value);
                setNotFound(false);
              }}
              error={
                notFound
                  ? 'Aucun cercle ne correspond à ce code. Vérifiez-le auprès du fondateur.'
                  : notActive
                    ? "Ce cercle n'est pas encore activé par son fondateur. Réessayez plus tard."
                    : undefined
              }
            />
            <button type="submit" hidden aria-hidden tabIndex={-1} />
          </form>
        )}

        {/* ── Fiche du cercle ── */}
        {step === 'fiche' && circle && (
          <div className="space-y-5">
            <StepTitle
              title="Fiche du cercle"
              subtitle="Générée automatiquement à partir des réglages du cercle. Lisez-la avant de poursuivre."
            />
            <section className="rounded-[20px] border border-line bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-bold text-ink">{circle.name}</p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {typeLabels[circle.type] ?? circle.type} · {circle.memberCount} membre(s)
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                    phase === 'ACTIVE' ? 'bg-amber-tint text-amber-dark' : 'bg-primary-tint text-primary-dark'
                  }`}
                >
                  {phase === 'ACTIVE' ? 'En cours' : 'Nouveau'}
                </span>
              </div>
              <div className="my-3 h-px bg-line" />
              <p className="text-[14px] text-muted">
                Cotisation : <span className="font-semibold text-ink">{cotisationLine(circle)}</span> par tour
              </p>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between gap-3 px-1">
                <h2 className="text-[15px] font-semibold text-ink">Conditions d&apos;adhésion</h2>
                <span className="text-[12px] font-semibold text-muted">Résumé automatique</span>
              </div>
              <div className="rounded-[20px] bg-fill p-4">
                <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">
                  {buildConditionsText(circle, cycle, rachat, deposit)}
                </p>
              </div>
            </section>

            {needsPayment && (
              <section className="rounded-[20px] border border-line bg-white px-4">
                <KeyValue label="Frais de rachat des tours passés" value={formatFcfa(rachat)} />
                <KeyValue label="Dépôt de garantie" value={formatFcfa(deposit)} />
                <KeyValue label="Total à payer" value={formatFcfa(total)} strong last />
              </section>
            )}

            <CheckRow
              checked={conditionsAccepted}
              onChange={setConditionsAccepted}
              label="J'ai lu et j'accepte les conditions du cercle"
            />
          </div>
        )}

        {/* ── Informations du candidat ── */}
        {step === 'form' && circle && (
          <div className="space-y-5">
            <StepTitle title="Vos informations" subtitle="Elles sont transmises au fondateur pour valider votre entrée." />
            <div className="space-y-4">
              <TextField
                label="Nom complet"
                placeholder="Ex. Aminata Ouédraogo"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              />
              <TextField
                label="Numéro de téléphone"
                placeholder="+226 70 12 34 56"
                type="tel"
                inputMode="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
              />
              <TextField
                label="Numéro de dépôt Mobile Money"
                placeholder="+226 70 12 34 56"
                type="tel"
                inputMode="tel"
                value={form.depositNumber}
                onChange={(e) => setForm((p) => ({ ...p, depositNumber: e.target.value }))}
                hint="Numéro sur lequel vous recevrez la cagnotte."
              />
            </div>

            {accountVerified ? (
              <Notice icon={ShieldCheck} tone="primary">
                Identité vérifiée — aucune pièce à fournir. Vos informations sont transmises au fondateur, qui validera
                votre entrée.
              </Notice>
            ) : needsDocs ? (
              <section>
                <h2 className="text-[15px] font-semibold text-ink">Documents exigés</h2>
                <p className="mb-2.5 mt-0.5 text-[13px] text-muted">Exigence du cercle : {kycLabel}</p>
                <div className="space-y-2.5">
                  <DocRow
                    label="CNIB recto"
                    doneLabel="CNIB recto ajouté"
                    action="Choisir le recto"
                    done={docs.cnibFront}
                    onChange={(v) => setDocs((p) => ({ ...p, cnibFront: v }))}
                  />
                  <DocRow
                    label="CNIB verso"
                    doneLabel="CNIB verso ajouté"
                    action="Choisir le verso"
                    done={docs.cnibBack}
                    onChange={(v) => setDocs((p) => ({ ...p, cnibBack: v }))}
                  />
                  {needsSelfie && (
                    <DocRow
                      label="Selfie facial"
                      doneLabel="Selfie ajouté"
                      action="Prendre un selfie"
                      capture
                      done={docs.selfie}
                      onChange={(v) => setDocs((p) => ({ ...p, selfie: v }))}
                    />
                  )}
                </div>
              </section>
            ) : null}
          </div>
        )}

        {/* ── Paiement de la place (parcours de paiement unique) ── */}
        {step === 'payment' && circle && (
          <div className="space-y-4">
            <div className="rounded-[20px] bg-primary-tint px-5 py-5 text-center">
              <p className="text-[13px] text-primary-dark">Montant à payer</p>
              <p className="mt-1 text-[28px] font-bold leading-tight text-ink">{formatFcfa(total)}</p>
              <p className="mt-0.5 text-[13px] text-muted">Adhésion · {circle.name}</p>
            </div>
            <MobileMoneyCheckout
              amount={total}
              phone={me.phoneNumber}
              title="Choisissez l'opérateur"
              details={[
                { label: 'Cercle', value: circle.name },
                { label: 'Frais de rachat des tours passés', value: formatFcfa(rachat) },
                { label: 'Dépôt de garantie', value: formatFcfa(deposit) },
              ]}
              confirmDetail={`Adhésion · ${circle.name}`}
              onSuccess={onPaid}
            />
            <p className="px-1 text-[13px] text-muted">Le montant est vérifié avant l&apos;approbation du fondateur.</p>
          </div>
        )}

        {/* ── Demande envoyée ── */}
        {step === 'done' && (
          <CenteredState
            icon={Check}
            title="Demande envoyée"
            text={
              needsPayment ? (
                <>
                  Paiement reçu (<strong className="text-ink">{paymentRef}</strong>). Votre demande d&apos;adhésion à{' '}
                  <strong className="text-ink">{circle?.name}</strong> est en attente de validation par le fondateur.
                </>
              ) : (
                <>
                  Votre demande d&apos;adhésion à <strong className="text-ink">{circle?.name}</strong> est en attente de
                  validation par le fondateur.
                </>
              )
            }
          />
        )}

        {footer && <ScreenFooter>{footer}</ScreenFooter>}
      </ScreenBody>
    </>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-[22px] font-bold leading-tight text-ink">{title}</h1>
      <p className="mt-1 text-[15px] text-muted">{subtitle}</p>
    </div>
  );
}

/**
 * Pièce à fournir : choisir un fichier (ou prendre une photo sur téléphone) marque la
 * pièce comme ajoutée ; un nouveau clic la retire. Démo : le fichier n'est pas envoyé.
 * TODO API : `POST /uploads` puis `POST /circles/:id/join` avec les `fileId` (section 6).
 */
function DocRow({
  label,
  doneLabel,
  action,
  done,
  capture = false,
  onChange,
}: {
  label: string;
  doneLabel: string;
  action: string;
  done: boolean;
  capture?: boolean;
  onChange: (done: boolean) => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const body = (
    <>
      <span
        aria-hidden
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          done ? 'bg-primary text-white' : 'bg-primary-tint text-primary'
        }`}
      >
        {done ? <Check size={18} strokeWidth={2.5} /> : <Upload size={18} />}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[15px] font-semibold text-ink">{label}</span>
        <span className={`block text-[13px] ${done ? 'font-semibold text-primary' : 'text-muted'}`}>
          {done ? doneLabel : action}
        </span>
      </span>
    </>
  );
  const rowClass = `flex w-full items-center gap-3 rounded-[16px] border p-3.5 ${
    done ? 'border-primary bg-[#F7FBF9]' : 'border-line bg-white hover:bg-fill'
  }`;

  if (done) {
    return (
      <button type="button" onClick={() => onChange(false)} aria-label={`${doneLabel} — retirer`} className={rowClass}>
        {body}
      </button>
    );
  }
  return (
    <label htmlFor={id} className={`${rowClass} cursor-pointer`}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        capture={capture ? 'user' : undefined}
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.[0]) onChange(true);
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
      {body}
    </label>
  );
}
