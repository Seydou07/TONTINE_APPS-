'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Check, CheckCircle2, ChevronLeft, Copy, Loader2, Phone, Smartphone } from 'lucide-react';
import { PaymentMethod } from '@venega/types';
import { OperatorLogo } from '@/features/aid/components/OperatorMark';
import { OPERATORS } from '@/features/aid/format';
import { PAYABLE_OPERATORS, type PayableOperator } from '@/features/aid/schema';
import { btnPrimary, btnSecondary, card, label as labelClass, sectionTitle } from '@/components/ui/classes';
import { SummaryRow } from '@/components/ui/misc';
import { formatFcfa, formatPhone } from '@/lib/format';

/**
 * Parcours de paiement unique du site (identique à l'app mobile et à la page
 * publique de cagnotte) :
 *   1. choix de l'opérateur ;
 *   2. bouton « Payer X F CFA » ;
 *   3. confirmation (montant, opérateur, numéro) ;
 *   4. instruction USSD / validation sur le téléphone, puis vérification.
 * Toutes les cotisations, frais d'activation et adhésions passent par ici.
 */

interface MobileMoneyCheckoutProps {
  amount: number;
  /** Numéro Mobile Money débité (format international). */
  phone: string;
  /** Lignes du récapitulatif affichées avant le choix (« Cercle », « Type »…). */
  details?: { label: string; value: ReactNode }[];
  /** Phrase affichée après le paiement validé. */
  successText?: string;
  /** Action après succès. */
  done?: { href: string; label: string } | { onClick: () => void; label: string };
  /** Titre de la carte. */
  title?: string;
  /** Ligne facultative sur l'étape de confirmation (ex. « Versement à Awa Zongo »). */
  confirmDetail?: string;
  /** Appelé une fois le paiement validé (mise à jour du store de démo). */
  onSuccess?: () => void;
}

type Step = 'select' | 'confirm' | 'ussd' | 'checking' | 'done';

/** Code USSD de démonstration (même règle que buildUssdCode du mobile) — en production, il est fourni par l'API Venega (jamais calculé côté client). */
function demoUssdCode(operator: PayableOperator, amount: number): string {
  const prefix = operator === PaymentMethod.MOOV_MONEY ? '802' : operator === PaymentMethod.WAVE ? '888' : '800';
  return `*${prefix}*${Math.round(amount)}*${Math.floor(100 + Math.random() * 900)}#`;
}

function instructionsFor(operator: PayableOperator, phone: string): string[] {
  const label = OPERATORS[operator].label;
  if (operator === PaymentMethod.WAVE) {
    return [
      `Ouvrez l'application Wave sur le téléphone du ${phone}.`,
      'Une demande de paiement Venega vous attend : vérifiez le montant.',
      'Validez avec votre code secret Wave.',
    ];
  }
  return [
    `Composez le code ci-dessous depuis le ${phone}.`,
    'Vérifiez le montant et le bénéficiaire « Venega ».',
    `Saisissez votre code secret ${label} pour valider.`,
  ];
}

export function MobileMoneyCheckout({
  amount,
  phone,
  details = [],
  successText,
  done,
  title = 'Paiement Mobile Money',
  confirmDetail,
  onSuccess,
}: MobileMoneyCheckoutProps) {
  const [operator, setOperator] = useState<PayableOperator | null>(null);
  const [step, setStep] = useState<Step>('select');
  const [ussd, setUssd] = useState('');
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const firstRender = useRef(true);

  const displayPhone = formatPhone(phone);
  const payLabel = `Payer ${formatFcfa(amount)}`;

  useEffect(() => () => clearTimeout(timer.current), []);

  // Ramène le haut de la carte à l'écran à chaque étape.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [step]);

  function confirm() {
    if (!operator) return;
    // TODO: POST /payments (API Venega) -> l'API initie le paiement chez l'agrégateur
    // et renvoie le code USSD / la référence ; aucune clé d'agrégateur côté navigateur.
    setUssd(demoUssdCode(operator, amount));
    setStep('ussd');
  }

  function validated() {
    setStep('checking');
    // Démo : en production, on attend le statut de la transaction (webhook côté API).
    timer.current = setTimeout(() => {
      setStep('done');
      onSuccess?.();
    }, 1800);
  }

  function copyCode() {
    navigator.clipboard?.writeText(ussd).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const heading = (text: string) => (
    <h2 ref={headingRef} tabIndex={-1} className={`${sectionTitle} scroll-mt-4 outline-none`}>
      {text}
    </h2>
  );

  // ── 5. Paiement validé ──
  if (step === 'done') {
    return (
      <section className={`${card} p-5 text-center`} aria-live="polite">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint text-primary">
          <CheckCircle2 size={30} aria-hidden />
        </span>
        {heading('Paiement validé')}
        <p className="mt-2 text-[15px] text-muted">
          {successText ?? `${formatFcfa(amount)} ont bien été reçus.`}
        </p>
        {done && (
          <div className="mt-5">
            {'href' in done ? (
              <Link href={done.href} className={btnPrimary}>
                {done.label}
              </Link>
            ) : (
              <button type="button" onClick={done.onClick} className={btnPrimary}>
                {done.label}
              </button>
            )}
          </div>
        )}
      </section>
    );
  }

  // ── 4. Instruction USSD + vérification ──
  if ((step === 'ussd' || step === 'checking') && operator) {
    const checking = step === 'checking';
    const isWave = operator === PaymentMethod.WAVE;
    return (
      <section className={`${card} p-5`}>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-amber-tint text-amber-dark">
            <Smartphone size={22} aria-hidden />
          </span>
          <div>
            {heading('Validez sur votre téléphone')}
            <p className="mt-1 text-[14px] text-muted">
              {formatFcfa(amount)} via {OPERATORS[operator].label}
            </p>
          </div>
        </div>

        <ol className="mt-4 space-y-2.5">
          {instructionsFor(operator, displayPhone).map((line, i) => (
            <li key={i} className="flex gap-3 text-[15px] text-ink">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-tint text-[12px] font-bold text-primary-dark">
                {i + 1}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>

        {!isWave && (
          <div className="mt-4 rounded-[14px] border border-line bg-fill p-4 text-center">
            <p className="text-[13px] text-muted">Code à composer</p>
            <p className="mt-1 font-mono text-[22px] font-bold tracking-wider text-ink">{ussd}</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <a
                href={`tel:${encodeURIComponent(ussd)}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-white text-[14px] font-semibold text-primary-dark ring-1 ring-line hover:bg-primary-tint"
              >
                <Phone size={16} aria-hidden />
                Composer
              </a>
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-white text-[14px] font-semibold text-ink ring-1 ring-line hover:bg-fill"
              >
                {copied ? <Check size={16} className="text-primary" aria-hidden /> : <Copy size={16} aria-hidden />}
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
          </div>
        )}

        <p className="mt-4 text-[13px] text-muted">
          Dès que la transaction est détectée, le paiement est validé automatiquement.
        </p>

        <div className="mt-4 space-y-2.5">
          <button type="button" onClick={validated} disabled={checking} className={btnPrimary}>
            {checking ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden />
                Vérification du paiement…
              </>
            ) : (
              "J'ai validé le paiement"
            )}
          </button>
          <button type="button" onClick={() => setStep('select')} disabled={checking} className={btnSecondary}>
            Annuler
          </button>
        </div>
      </section>
    );
  }

  // ── 3. Confirmation ──
  if (step === 'confirm' && operator) {
    return (
      <section className={`${card} p-5`}>
        <button
          type="button"
          onClick={() => setStep('select')}
          className="-ml-1 mb-3 inline-flex items-center gap-1 text-[14px] font-medium text-muted hover:text-ink"
        >
          <ChevronLeft size={18} aria-hidden />
          Modifier
        </button>
        {heading('Confirmer le paiement')}
        <p className="mt-1 text-[15px] text-muted">
          Vous êtes sur le point de payer <strong className="text-ink">{formatFcfa(amount)}</strong> depuis le numéro{' '}
          <strong className="text-ink">{displayPhone}</strong>.
        </p>
        {confirmDetail && <p className="mt-1 text-[14px] text-muted">{confirmDetail}</p>}

        <dl className="mt-4 divide-y divide-[#EEF0F2] rounded-[14px] bg-fill px-4">
          <SummaryRow label="Montant">
            <span className="text-[17px] font-bold">{formatFcfa(amount)}</span>
          </SummaryRow>
          <SummaryRow label="Opérateur">
            <span className="inline-flex items-center gap-2">
              <OperatorLogo method={operator} size={24} decorative />
              {OPERATORS[operator].label}
            </span>
          </SummaryRow>
          <SummaryRow label="Numéro">{displayPhone}</SummaryRow>
        </dl>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => setStep('select')} className={btnSecondary}>
            Annuler
          </button>
          <button type="button" onClick={confirm} className={btnPrimary}>
            Confirmer
          </button>
        </div>
      </section>
    );
  }

  // ── 1–2. Récapitulatif, choix de l'opérateur, bouton Payer ──
  return (
    <section className={`${card} p-5`}>
      {heading(title)}

      <dl className="mt-3 divide-y divide-[#EEF0F2] rounded-[14px] bg-fill px-4">
        {details.map((d) => (
          <SummaryRow key={d.label} label={d.label}>
            {d.value}
          </SummaryRow>
        ))}
        <SummaryRow label="Numéro débité">{displayPhone}</SummaryRow>
        <SummaryRow label="Montant">
          <span className="text-[17px] font-bold text-primary-dark">{formatFcfa(amount)}</span>
        </SummaryRow>
      </dl>

      <fieldset className="mt-5">
        <legend className={labelClass}>Opérateur Mobile Money</legend>
        <div role="radiogroup" className="grid grid-cols-3 gap-2.5">
          {PAYABLE_OPERATORS.map((key) => {
            const selected = operator === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setOperator(key)}
                className={`relative flex h-[84px] flex-col items-center justify-center gap-1.5 rounded-[12px] border px-1 text-[13px] font-semibold text-ink transition-colors ${
                  selected ? 'border-primary bg-[#F0F7F4]' : 'border-line bg-white hover:bg-fill'
                }`}
              >
                <OperatorLogo method={key} size={32} decorative />
                {OPERATORS[key].label}
                {selected && <Check size={14} className="absolute right-1.5 top-1.5 text-primary" aria-hidden />}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={() => setStep('confirm')}
        disabled={!operator}
        className={`${btnPrimary} mt-5`}
      >
        {payLabel}
      </button>
      {!operator && <p className="mt-2 text-center text-[13px] text-muted">Choisissez un opérateur pour continuer.</p>}
    </section>
  );
}
